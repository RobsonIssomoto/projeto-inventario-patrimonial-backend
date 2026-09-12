import type { Request, Response } from "express";
import usuarioService from "./usuario.service.js";
import type { ICreateUsuarioDTO } from "./usuario.types.js";

class UsuarioController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { uid, nome, email, setor, perfil, ativo } = request.body;

      if (!uid || typeof uid !== "string") {
        return response.status(400).json({
          erro: "O uid do Firebase é obrigatório.",
        });
      }

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

      if (!setor || typeof setor !== "string") {
        return response.status(400).json({
          erro: "O setor é obrigatório.",
        });
      }

      if (perfil !== "operador" && perfil !== "administrador") {
        return response.status(400).json({
          erro: "O perfil deve ser operador ou administrador.",
        });
      }

      if (ativo !== undefined && typeof ativo !== "boolean") {
        return response.status(400).json({
          erro: "O campo ativo deve ser booleano.",
        });
      }

      const dadosValidados: ICreateUsuarioDTO = {
        uid: uid.trim(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        setor: setor.trim(),
        perfil,
        ativo: ativo ?? true,
      };

      const novoUsuario = await usuarioService.create(dadosValidados);

      return response.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",
        dados: novoUsuario,
      });
    } catch (error: unknown) {
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
