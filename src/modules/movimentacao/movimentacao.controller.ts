import type { Request, Response } from "express";
import { Types } from "mongoose";
import movimentacaoService from "./movimentacao.service.js";
import type {
  ICreateMovimentacaoDTO,
  TipoMovimentacao,
} from "./movimentacao.types.js";

class MovimentacaoController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const {
        usuarioId,
        patrimonioId,
        tipo,
        secretaria,
        sala,
        dataHora,
        dados,
      } = request.body;

      if (!usuarioId || typeof usuarioId !== "string") {
        return response.status(400).json({
          erro: "O ID do usuário é obrigatório.",
        });
      }

      if (!patrimonioId || typeof patrimonioId !== "string") {
        return response.status(400).json({
          erro: "O ID do patrimônio é obrigatório.",
        });
      }

      if (
        tipo !== "conferencia" &&
        tipo !== "atualizacao_localizacao" &&
        tipo !== "transferencia"
      ) {
        return response.status(400).json({
          erro: "Tipo de movimentação inválido.",
        });
      }

      if (!secretaria || typeof secretaria !== "string") {
        return response.status(400).json({
          erro: "O secretaria é obrigatório.",
        });
      }

      if (!sala || typeof sala !== "string") {
        return response.status(400).json({
          erro: "A sala é obrigatória.",
        });
      }

      if (!dataHora) {
        return response.status(400).json({
          erro: "A data e hora são obrigatórias.",
        });
      }

      const data = new Date(dataHora);

      if (Number.isNaN(data.getTime())) {
        return response.status(400).json({
          erro: "Data inválida.",
        });
      }

      if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        return response.status(400).json({
          erro: "Os dados devem ser um objeto válido.",
        });
      }

      if (!Types.ObjectId.isValid(usuarioId)) {
        return response.status(400).json({
          erro: "ID do usuário inválido.",
        });
      }

      if (!Types.ObjectId.isValid(patrimonioId)) {
        return response.status(400).json({
          erro: "ID do patrimônio inválido.",
        });
      }

      if (tipo === "conferencia") {
        if (
          dados.status !== "conferido" &&
          dados.status !== "pendente" &&
          dados.status !== "nao_localizado"
        ) {
          return response.status(400).json({
            erro: "Status inválido para conferência.",
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
            erro: "Estado de conservação inválido.",
          });
        }

        if (
          dados.observacoes !== undefined &&
          typeof dados.observacoes !== "string"
        ) {
          return response.status(400).json({
            erro: "Observações devem ser texto.",
          });
        }
      }

      if (tipo === "atualizacao_localizacao" || tipo === "transferencia") {
        if (
          !dados.secretariaOrigem ||
          typeof dados.secretariaOrigem !== "string"
        ) {
          return response.status(400).json({
            erro: "A secretaria de origem é obrigatória.",
          });
        }

        if (!dados.salaOrigem || typeof dados.salaOrigem !== "string") {
          return response.status(400).json({
            erro: "A sala de origem é obrigatória.",
          });
        }

        if (
          !dados.secretariaDestino ||
          typeof dados.secretariaDestino !== "string"
        ) {
          return response.status(400).json({
            erro: "A secretaria de destino é obrigatória.",
          });
        }

        if (!dados.salaDestino || typeof dados.salaDestino !== "string") {
          return response.status(400).json({
            erro: "A sala de destino é obrigatória.",
          });
        }

        if (
          dados.secretariaOrigem.trim() === dados.secretariaDestino.trim() &&
          dados.salaOrigem.trim() === dados.salaDestino.trim()
        ) {
          return response.status(400).json({
            erro: "A origem e o destino não podem ser iguais.",
          });
        }

        if (tipo === "transferencia") {
          if (
            !dados.motivo ||
            typeof dados.motivo !== "string" ||
            dados.motivo.trim().length === 0
          ) {
            return response.status(400).json({
              erro: "O motivo é obrigatório para transferência.",
            });
          }
        }
      }

      const usuario = new Types.ObjectId(usuarioId);
      const patrimonio = new Types.ObjectId(patrimonioId);

      const dadosValidados: ICreateMovimentacaoDTO = {
        usuario,
        patrimonio,
        tipo: tipo as TipoMovimentacao,
        secretaria: secretaria.trim(),
        sala: sala.trim(),
        dataHora: data,
        dados: {
          status: dados.status,
          estadoConservacao: dados.estadoConservacao,
          observacoes:
            typeof dados.observacoes === "string"
              ? dados.observacoes.trim()
              : undefined,
          secretariaOrigem:
            typeof dados.secretariaOrigem === "string"
              ? dados.secretariaOrigem.trim()
              : undefined,
          secretariaDestino:
            typeof dados.secretariaDestino === "string"
              ? dados.secretariaDestino.trim()
              : undefined,
          salaOrigem:
            typeof dados.salaOrigem === "string"
              ? dados.salaOrigem.trim()
              : undefined,
          salaDestino:
            typeof dados.salaDestino === "string"
              ? dados.salaDestino.trim()
              : undefined,
          motivo:
            typeof dados.motivo === "string" ? dados.motivo.trim() : undefined,
        },
      };

      const novaMovimentacao = await movimentacaoService.create(dadosValidados);

      return response.status(201).json({
        mensagem: "Movimentação registrada com sucesso!",
        dados: novaMovimentacao,
      });
    } catch (error: unknown) {
      console.error("Erro ao criar movimentação.", error);

      return response.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }

  public async findAll(
    request: Request,
    response: Response,
  ): Promise<Response> {
    try {
      const {patrimonio, usuario, tipo, secretaria, sala, ordenarPor } =
        request.query;

      const filtros: Record<string, any> = {};


      if (patrimonio) filtros.patrimonio = String(patrimonio);
      if(usuario) filtros.usuario = String(usuario);
      if (tipo) filtros.tipo = String(tipo);
      if (secretaria) filtros.secretaria = String(secretaria);
      if (sala) filtros.sala = String(sala);

      let ordenacao: Record<string, 1 | -1> = { dataHora: -1 };

      if (ordenarPor === "antigos") {
        ordenacao = { dataHora: 1 };
      } else if (ordenarPor === "numero") {
        ordenacao = { numeroPatrimonio: 1 };
      }

      const movimentacoes = await movimentacaoService.findAll(
        filtros,
        ordenacao,
      );
      return response.status(200).json(movimentacoes);
    } catch (error) {
      console.error("Erro ao listar movimentações.", error);
      return response.status(500).json({ erro: "Erro interno no servidor." });
    }
  }
  //   public async findByPatrimonio(request: Request, response: Response): Promise<Response> {
  //     try{

  //     }catch(){

  //     }
  //   }
  //   public async findByUsuario(request: Request, response: Response): Promise<Response> {    try{

  //     }catch(){

  //     }
  // }
}

export default new MovimentacaoController();
