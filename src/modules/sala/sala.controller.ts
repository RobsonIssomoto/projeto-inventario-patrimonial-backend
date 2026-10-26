import { Types } from "mongoose";
import type { Request, Response } from "express";
import salaService from "./sala.service.js";
import type { IUpdateSalaDTO } from "./sala.types.js";

class SalaController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { nome, secretaria } = request.body ?? {};
      if (typeof nome !== "string" || nome.trim().length === 0) {
        return response.status(400).json({ message: "O nome da sala é obrigatório e deve ser texto." });
      }

      if (typeof secretaria !== "string" || secretaria.trim().length === 0) {
        return response.status(400).json({
          message: "O ID da secretaria é obrigatório e deve ser texto.",
        });
      }

      const secretariaId = secretaria.trim();

      if (!Types.ObjectId.isValid(secretariaId)) {
        return response.status(400).json({
          message: "ID da secretaria inválido.",
        });
      }

      const sala = await salaService.create({
        nome: nome.trim(),
        secretaria: secretariaId,
      });

      return response.status(201).json(sala);
    } catch (error) {
      console.error("Erro ao cadastrar sala.", error);

      return response.status(400).json({
        message: "Não foi possível cadastrar a sala. Verifique os dados informados.",
      });
    }
  }

  public async findAll(request: Request, response: Response) {
    try {
      const { nome, secretaria, ativa } = request.query;

      const filtros: {
        nome?: string;
        secretaria?: string;
        ativa?: boolean;
      } = {};

      if (nome !== undefined) {
        if (typeof nome !== "string" || nome.trim().length === 0) {
          return response.status(400).json({
            message: "O filtro nome deve ser um texto preenchido.",
          });
        }

        filtros.nome = nome.trim();
      }

      if (secretaria !== undefined) {
        if (typeof secretaria !== "string" || !Types.ObjectId.isValid(secretaria.trim())) {
          return response.status(400).json({
            message: "ID da secretaria inválido.",
          });
        }

        filtros.secretaria = secretaria.trim();
      }

      if (ativa !== undefined) {
        if (ativa !== "true" && ativa !== "false") {
          return response.status(400).json({
            message: "O filtro ativa deve ser true ou false.",
          });
        }

        filtros.ativa = ativa === "true";
      }

      const salas = await salaService.findAll(filtros, { nome: 1 });

      return response.status(200).json(salas);
    } catch (error) {
      console.error("Erro ao listar salas.", error);

      return response.status(500).json({
        message: "Erro ao listar salas.",
      });
    }
  }

  public async findById(request: Request, response: Response) {
    try {
      const id = request.params.id;

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return response.status(400).json({
          message: "ID da sala inválido.",
        });
      }

      const sala = await salaService.findById(id);

      if (!sala) {
        return response.status(404).json({
          message: "Sala não encontrada.",
        });
      }

      return response.status(200).json(sala);
    } catch (error) {
      console.error("Erro ao buscar sala.", error);

      return response.status(500).json({
        message: "Erro ao buscar sala.",
      });
    }
  }

  public async update(request: Request, response: Response) {
    try {
      const id = request.params.id;

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return response.status(400).json({
          message: "ID da sala inválido.",
        });
      }

      const { nome, ativa } = request.body ?? {};

      const dados: IUpdateSalaDTO = {};

      if (nome !== undefined) {
        if (typeof nome !== "string" || nome.trim().length === 0) {
          return response.status(400).json({
            message: "O nome da sala deve ser um texto preenchido.",
          });
        }

        dados.nome = nome.trim();
      }

      if (ativa !== undefined) {
        if (typeof ativa !== "boolean") {
          return response.status(400).json({
            message: "O campo ativa deve ser true ou false.",
          });
        }

        dados.ativa = ativa;
      }

      if (nome === undefined && ativa === undefined) {
        return response.status(400).json({
          message: "Informe nome ou ativa para atualizar a sala.",
        });
      }

      const sala = await salaService.update(id, dados);

      if (!sala) {
        return response.status(404).json({
          message: "Sala não encontrada.",
        });
      }

      return response.status(200).json(sala);
    } catch (error) {
      console.error("Erro ao atualizar sala.", error);

      return response.status(400).json({
        message: "Não foi possível atualizar a sala. Verifique os dados informados.",
      });
    }
  }

  public async deactivate(request: Request, response: Response) {
    try {
      const id = request.params.id;

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return response.status(400).json({
          message: "ID da sala inválido.",
        });
      }

      const sala = await salaService.deactivate(id);

      if (!sala) {
        return response.status(404).json({
          message: "Sala não encontrada.",
        });
      }

      return response.status(200).json({
        message: "Sala desativada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao desativar sala.", error);

      return response.status(500).json({
        message: "Erro ao desativar sala.",
      });
    }
  }
}

export default new SalaController();
