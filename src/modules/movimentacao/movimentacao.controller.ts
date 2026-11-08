import type { Request, Response } from "express";
import { Types } from "mongoose";
import movimentacaoService from "./movimentacao.service.js";
import type { ICreateMovimentacaoDTO, TipoMovimentacao } from "./movimentacao.types.js";

class MovimentacaoController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { patrimonioId, tipo, dados } = request.body;

      const usuarioLogado = request.usuario;

      if (!usuarioLogado) {
        return response.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (!patrimonioId || typeof patrimonioId !== "string") {
        return response.status(400).json({
          message: "O ID do patrimônio é obrigatório.",
        });
      }

      if (!Types.ObjectId.isValid(patrimonioId)) {
        return response.status(400).json({
          message: "ID do patrimônio inválido.",
        });
      }

      if (tipo !== "conferencia" && tipo !== "atualizacao_localizacao" && tipo !== "transferencia") {
        return response.status(400).json({
          message: "Tipo de movimentação inválido.",
        });
      }

      if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        return response.status(400).json({
          message: "Os dados devem ser um objeto válido.",
        });
      }

      if (tipo === "conferencia") {
        if (dados.status !== "conferido" && dados.status !== "pendente" && dados.status !== "nao_localizado") {
          return response.status(400).json({
            message: "Status inválido para conferência.",
          });
        }

        if (
          dados.estadoConservacao !== "novo" &&
          dados.estadoConservacao !== "bom" &&
          dados.estadoConservacao !== "regular" &&
          dados.estadoConservacao !== "ruim" &&
          dados.estadoConservacao !== "inservivel"
        ) {
          return response.status(400).json({
            message: "Estado de conservação inválido.",
          });
        }

        if (dados.observacoes !== undefined && typeof dados.observacoes !== "string") {
          return response.status(400).json({
            message: "Observações devem ser texto.",
          });
        }
      }

      if (tipo === "atualizacao_localizacao" || tipo === "transferencia") {
        if (!dados.salaDestino || typeof dados.salaDestino !== "string") {
          return response.status(400).json({
            message: "A sala de destino é obrigatória.",
          });
        }

        if (!Types.ObjectId.isValid(dados.salaDestino)) {
          return response.status(400).json({
            message: "ID da sala de destino inválido.",
          });
        }

        if (tipo === "transferencia") {
          if (!dados.motivo || typeof dados.motivo !== "string" || dados.motivo.trim().length === 0) {
            return response.status(400).json({
              message: "O motivo é obrigatório para transferência.",
            });
          }
        }
      }

      const dadosValidados: ICreateMovimentacaoDTO = {
        usuario: usuarioLogado,
        patrimonioId,
        tipo: tipo as TipoMovimentacao,
        dados: {
          status: dados.status,
          estadoConservacao: dados.estadoConservacao,
          observacoes: typeof dados.observacoes === "string" ? dados.observacoes.trim() : undefined,
          salaDestino: typeof dados.salaDestino === "string" ? dados.salaDestino : undefined,
          motivo: typeof dados.motivo === "string" ? dados.motivo.trim() : undefined,
        },
      };

      const novaMovimentacao = await movimentacaoService.create(dadosValidados);

      return response.status(201).json({
        message: "Movimentação registrada com sucesso!",
        dados: novaMovimentacao,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Patrimônio não encontrado.") {
          return response.status(404).json({
            message: error.message,
          });
        }

        if (error.message === "O usuário não pertence à secretaria do patrimônio.") {
          return response.status(403).json({
            message: error.message,
          });
        }

        const mensagensEsperadas = [
          "Sala de destino não encontrada.",
          "A sala de destino está inativa.",
          "O patrimônio já está na sala informada.",
          "Para mudar de secretaria, utilize o tipo transferencia.",
          "Para mudar de sala na mesma secretaria, utilize o tipo atualizacao_localizacao.",
        ];

        if (mensagensEsperadas.includes(error.message)) {
          return response.status(400).json({
            message: error.message,
          });
        }
      }

      console.error("Erro ao criar movimentação.", error);

      return response.status(500).json({
        message: "Erro interno no servidor.",
      });
    }
  }

  public async findAll(request: Request, response: Response): Promise<Response> {
    try {
      const { patrimonio, usuario, tipo, secretaria, sala, ordenarPor } = request.query;

      const usuarioLogado = request.usuario;

      if (!usuarioLogado) {
        return response.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      for (const id of [patrimonio, usuario, secretaria, sala]) {
        if (id && !Types.ObjectId.isValid(String(id))) {
          return response.status(400).json({
            message: "ID inválido nos filtros.",
          });
        }
      }

      const filtros: Record<string, any> = {};

      if (usuarioLogado.perfil === "administrador") {
        if (secretaria) filtros.secretaria = String(secretaria);
      } else {
        filtros.$or = [
          { secretaria: usuarioLogado.secretaria },
          { "dados.secretariaDestino": usuarioLogado.secretaria },
        ];
      }

      if (patrimonio) filtros.patrimonio = String(patrimonio);
      if (usuario) filtros.usuario = String(usuario);
      if (tipo) filtros.tipo = String(tipo);
      if (sala) filtros.sala = String(sala);

      let ordenacao: Record<string, 1 | -1> = { dataHora: -1 };

      if (ordenarPor === "antigos") {
        ordenacao = { dataHora: 1 };
      }

      const movimentacoes = await movimentacaoService.findAll(filtros, ordenacao);
      return response.status(200).json(movimentacoes);
    } catch (error) {
      console.error("Erro ao listar movimentações.", error);
      return response.status(500).json({ message: "Erro interno no servidor." });
    }
  }
}

export default new MovimentacaoController();
