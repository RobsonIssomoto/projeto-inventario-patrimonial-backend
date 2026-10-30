import type { Request, Response } from "express";
import usuarioService from "./usuario.service.js";
import type { ICreateUsuarioDTO, PerfilUsuario } from "./usuario.types.js";
import { Types } from "mongoose";

class UsuarioController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { nome, email, secretaria, perfil, ativo } = request.body;

      if (!nome || typeof nome !== "string" || nome.trim().length < 3) {
        return response.status(400).json({
          erro: "O nome é obrigatório e deve ter no mínimo 3 caracteres.",
        });
      }

      if (!email || typeof email !== "string") {
        return response.status(400).json({
          erro: "O e-mail é obrigatório.",
        });
      }

      if (!secretaria || typeof secretaria !== "string") {
        return response.status(400).json({
          erro: "A secretaria é obrigatória.",
        });
      }

      const perfisPermitidos: PerfilUsuario[] = ["operador", "gerente", "administrador"];

      if (!perfil || !perfisPermitidos.includes(perfil)) {
        return response.status(400).json({
          erro: "O perfil deve ser operador, gerente ou administrador.",
        });
      }

      if (ativo !== undefined && typeof ativo !== "boolean") {
        return response.status(400).json({
          erro: "O campo ativo deve ser booleano.",
        });
      }

      if (ativo !== undefined && typeof ativo !== "boolean") {
        return response.status(400).json({
          erro: "O campo ativo deve ser booleano.",
        });
      }

      const dadosValidados: ICreateUsuarioDTO = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        secretaria: secretaria.trim(),
        perfil,
        ativo: ativo ?? true,
      };

      const novoUsuario = await usuarioService.create(dadosValidados);

      return response.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",
        dados: novoUsuario,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const mensagensEsperadas = [
          "ID da secretaria inválido.",
          "Secretaria não encontrada.",
          "Não é possível cadastrar usuário em uma secretaria inativa.",
        ];

        if (mensagensEsperadas.includes(error.message)) {
          return response.status(400).json({
            erro: error.message,
          });
        }

        if (error.message.includes("email-already-exists")) {
          return response.status(409).json({
            erro: "Já existe um usuário com este e-mail.",
          });
        }

        if (error.message.includes("invalid-email")) {
          return response.status(400).json({
            erro: "E-mail inválido.",
          });
        }
      }
      console.error("Erro ao criar usuário.", error);

      return response.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }

  public async findById(request: Request, response: Response): Promise<Response> {
    try {
      const { uid } = request.params;

      if (!uid || typeof uid !== "string") {
        return response.status(400).json({
          erro: "UID inválido.",
        });
      }

      const usuario = await usuarioService.findById(uid);

      if (!usuario) {
        return response.status(404).json({
          erro: "Usuário não encontrado.",
        });
      }

      return response.status(200).json(usuario);
    } catch (error: unknown) {
      console.error("Erro ao buscar usuário.", error);

      return response.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }
}

export default new UsuarioController();
