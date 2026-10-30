import type { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../../config/firebase.js";
import { Usuario } from "./usuario.model.js";
import type { IUsuario } from "./usuario.types.js";

declare global {
  namespace Express {
    interface Request {
      usuario?: IUsuario;
    }
  }
}

export async function autenticar(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
  try {
    const cabecalhoAutorizacao = request.headers.authorization;

    if (!cabecalhoAutorizacao?.startsWith("Bearer ")) {
      return response.status(401).json({
        erro: "Token de autenticação não informado.",
      });
    }

    const token = cabecalhoAutorizacao.replace("Bearer ", "").trim();

    if (!token) {
      return response.status(401).json({
        erro: "Token de autenticação não informado.",
      });
    }

    const tokenDecodificado = await firebaseAuth.verifyIdToken(token);

    const usuario = await Usuario.findOne({
      uid: tokenDecodificado.uid,
    });

    if (!usuario) {
      return response.status(401).json({
        erro: "Usuário não encontrado no sistema.",
      });
    }

    if (!usuario.ativo) {
      return response.status(403).json({
        erro: "Usuário desativado.",
      });
    }

    request.usuario = usuario;

    return next();
  } catch (error: any) {
    if (error?.code === "auth/id-token-expired" || error?.code === "auth/argument-error") {
      return response.status(401).json({
        erro: "Token inválido ou expirado.",
      });
    }

    console.error("Erro ao autenticar usuário.", error);

    return response.status(500).json({
      erro: "Erro ao autenticar usuário.",
    });
  }
}

type PerfilPermitido = "operador" | "gerente" | "administrador";

export function autorizar(perfisPermitidos: PerfilPermitido[]) {
  return (request: Request, response: Response, next: NextFunction): Response | void => {
    const usuario = request.usuario;

    if (!usuario) {
      return response.status(401).json({
        erro: "Usuário não autenticado.",
      });
    }

    if (!perfisPermitidos.includes(usuario.perfil)) {
      return response.status(403).json({
        erro: "Usuário não possui permissão para realizar esta operação.",
      });
    }

    return next();
  };
}
