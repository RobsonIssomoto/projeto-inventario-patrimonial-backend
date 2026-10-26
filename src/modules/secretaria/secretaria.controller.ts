import type { Request, Response } from "express";
import secretariaService from "./secretaria.service.js";

class SecretariaController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const secretaria = await secretariaService.create(request.body);

      return response.status(201).json(secretaria);
    } catch (error) {
      return response.status(400).json({ message: "Erro ao cadastrar secretaria." });
    }
  }

  public async findAll(request: Request, response: Response) {
    try {
      const secretarias = await secretariaService.findAll(request.query, { nome: 1 });

      return response.status(200).json(secretarias);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao listar secretarias." });
    }
  }

  public async findById(request: Request, response: Response) {
    try {
      const id = request.params.id as string;
      const secretaria = await secretariaService.findById(id);
      if (!secretaria) {
        return response.status(404).json({ message: "Secretaria não encontrada." });
      }

      return response.status(200).json(secretaria);
    } catch (error) {
      return response.status(500).json({
        message: "Erro ao buscar secretaria.",
      });
    }
  }
  public async update(request: Request, response: Response) {
    try {
      const id = request.params.id as string;
      const secretaria = await secretariaService.update(id, request.body);

      if (!secretaria) {
        return response.status(404).json({
          message: "Secretaria não encontrada.",
        });
      }

      return response.status(200).json(secretaria);
    } catch (error) {
      return response.status(400).json({
        message: "Erro ao atualizar secretaria.",
      });
    }
  }

  public async deactivate(request: Request, response: Response) {
    try {
      const id = request.params.id as string;
      const secretaria = await secretariaService.deactivate(id);

      if (!secretaria) {
        return response.status(404).json({
          message: "Secretaria não encontrada.",
        });
      }

      return response.status(200).json({
        message: "Secretaria desativada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao desativar secretaria", error);

      return response.status(500).json({
        message: "Erro ao desativar secretaria.",
      });
    }
  }
}

export default new SecretariaController();
