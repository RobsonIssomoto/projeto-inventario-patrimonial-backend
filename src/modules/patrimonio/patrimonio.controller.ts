import type { Request, Response } from "express";
import { Types } from "mongoose";
import patrimonioService from "./patrimonio.service.js";
import type { ICreatePatrimonioDTO, IUpdatePatrimonioDTO } from "./patrimonio.types.js";

class PatrimonioController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { numeroPatrimonio, descricao, secretaria, sala, categoria, observacoes } = request.body;

      if (!numeroPatrimonio || typeof numeroPatrimonio !== "string") {
        return response.status(400).json({ erro: "O número do patrimônio é obrigatório." });
      }

      if (!descricao || typeof descricao !== "string" || descricao.trim().length < 3) {
        return response.status(400).json({ erro: "A descrição é obrigatória e deve ter no mínimo 3 caracteres." });
      }

      if (!secretaria || typeof secretaria !== "string") {
        return response.status(400).json({ erro: "A secretaria é obrigatória." });
      }

      if (!sala || typeof sala !== "string") {
        return response.status(400).json({ erro: "A sala é obrigatória." });
      }

      if (!Types.ObjectId.isValid(secretaria)) {
        return response.status(400).json({
          erro: "ID da secretaria inválido.",
        });
      }

      if (!Types.ObjectId.isValid(sala)) {
        return response.status(400).json({
          erro: "ID da sala inválido.",
        });
      }

      const dadosValidados: ICreatePatrimonioDTO = {
        numeroPatrimonio: numeroPatrimonio.trim(),
        descricao: descricao.trim(),
        secretaria: secretaria.trim(),
        sala: sala.trim(),
        categoria,
        observacoes,
      };

      const novoPatrimonio = await patrimonioService.create(dadosValidados);

      return response.status(201).json({
        mensagem: "Patrimônio cadastrado com sucesso!",
        dados: novoPatrimonio,
      });
    } catch (error: unknown) {
      const mensagensEsperadas = [
        "Secretaria não encontrada.",
        "Não é possível cadastrar patrimônio em uma secretaria inativa.",
        "Sala não encontrada.",
        "Não é possível cadastrar patrimônio em uma sala inativa.",
        "A sala informada não pertence à secretaria informada.",
      ];

      if (error instanceof Error && mensagensEsperadas.includes(error.message)) {
        return response.status(400).json({
          erro: error.message,
        });
      }

      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        return response.status(409).json({
          erro: "Número de patrimônio já cadastrado no sistema.",
        });
      }

      console.error("Erro interno no Controller de Patrimônio ao criar.", error);

      return response.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }

  public async listar(request: Request, response: Response): Promise<Response> {
    try {
      const { busca, secretaria, sala, categoria, status, ordenarPor } = request.query;

      const filtros: Record<string, any> = {};

      if (busca) {
        filtros.$or = [
          { numeroPatrimonio: { $regex: String(busca), $options: "i" } },
          { descricao: { $regex: String(busca), $options: "i" } },
        ];
      }
      //validar os IDs e manter como referências

      if (secretaria) {
        if (!Types.ObjectId.isValid(String(secretaria))) {
          return response.status(400).json({
            erro: "ID da secretaria inválido.",
          });
        }

        filtros.secretaria = new Types.ObjectId(String(secretaria));
      }

      if (sala) {
        if (!Types.ObjectId.isValid(String(sala))) {
          return response.status(400).json({
            erro: "ID da sala inválido.",
          });
        }

        filtros.sala = new Types.ObjectId(String(sala));
      }

      if (categoria) filtros.categoria = String(categoria);
      if (status) filtros.status = String(status);

      let ordenacao: Record<string, 1 | -1> = { createdAt: -1 };

      if (ordenarPor === "antigos") {
        ordenacao = { createdAt: 1 };
      } else if (ordenarPor === "numero") {
        ordenacao = { numeroPatrimonio: 1 };
      }

      const patrimonios = await patrimonioService.findAll(filtros, ordenacao);
      return response.status(200).json(patrimonios);
    } catch (error: unknown) {
      return response.status(500).json({
        erro: "Erro ao listar patrimônios.",
      });
    }
  }

  public async findByNumero(request: Request, response: Response): Promise<Response> {
    try {
      const { numero } = request.params;

      if (!numero || typeof numero !== "string" || !numero.trim()) {
        return response.status(400).json({
          erro: "Número de patrimônio inválido.",
        });
      }

      const patrimonio = await patrimonioService.findByNumero(numero);

      if (!patrimonio) {
        return response.status(404).json({
          erro: "Patrimônio não localizado no sistema.",
        });
      }

      return response.status(200).json({
        mensagem: "Patrimônio localizado com sucesso.",
        dados: patrimonio,
      });
    } catch (error) {
      console.error("Erro ao buscar patrimônio por número.", error);

      return response.status(500).json({
        erro: "Erro ao buscar patrimônio por número.",
      });
    }
  }

  public async update(request: Request, response: Response): Promise<Response> {
    try {
      const parametroId = request.params.id;

      const id = Array.isArray(parametroId) ? parametroId[0] : parametroId;
      const { descricao, categoria, status, estadoConservacao, observacoes } = request.body;

      if (!id || !Types.ObjectId.isValid(id)) {
        return response.status(400).json({
          erro: "ID inválido.",
        });
      }

      if (
        descricao === undefined &&
        categoria === undefined &&
        status === undefined &&
        estadoConservacao === undefined &&
        observacoes === undefined
      ) {
        return response.status(400).json({
          erro: "Informe pelo menos um campo para atualização.",
        });
      }

      if (status !== undefined && !["conferido", "pendente", "nao_localizado"].includes(status)) {
        return response.status(400).json({
          erro: "Status inválido.",
        });
      }

      if (
        estadoConservacao !== undefined &&
        !["novo", "bom", "regular", "ruim", "inservivel"].includes(estadoConservacao)
      ) {
        return response.status(400).json({
          erro: "Estado de conservação inválido.",
        });
      }

      const patrimonioAtualizado = await patrimonioService.update(id, {
        descricao,
        categoria,
        status,
        estadoConservacao,
        observacoes,
      });

      if (!patrimonioAtualizado) {
        return response.status(404).json({
          erro: "Patrimônio não encontrado para atualização.",
        });
      }

      return response.status(200).json({
        mensagem: "Patrimônio atualizado com sucesso.",
        dados: patrimonioAtualizado,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Nenhum campo válido foi informado para atualização.") {
        return response.status(400).json({
          erro: error.message,
        });
      }

      console.error("Erro ao atualizar patrimônio.", error);

      return response.status(500).json({
        erro: "Erro ao atualizar patrimônio.",
      });
    }
  }

  public async deactivate(request: Request, response: Response): Promise<Response> {
    try {
      const parametroId = request.params.id;

      const id = Array.isArray(parametroId) ? parametroId[0] : parametroId;

      if (!id || !Types.ObjectId.isValid(id)) {
        return response.status(400).json({
          erro: "ID inválido.",
        });
      }

      const patrimonioDesativado = await patrimonioService.deactivate(id);

      if (!patrimonioDesativado) {
        return response.status(404).json({
          erro: "Patrimônio não encontrado para desativação.",
        });
      }

      return response.status(200).json({
        mensagem: "Patrimônio desativado com sucesso.",
        dados: patrimonioDesativado,
      });
    } catch (error) {
      console.error("Erro ao desativar patrimônio.", error);

      return response.status(500).json({
        erro: "Erro ao desativar patrimônio.",
      });
    }
  }
}

export default new PatrimonioController();
