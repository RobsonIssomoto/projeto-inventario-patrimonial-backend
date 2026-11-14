import mongoose from "mongoose";
import type { Types } from "mongoose";
import Movimentacao from "./movimentacao.model.js";
import Patrimonio from "../patrimonio/patrimonio.model.js";
import Sala from "../sala/sala.model.js";
import Secretaria from "../secretaria/secretaria.model.js";
import type { ICreateMovimentacaoDTO, IMovimentacao } from "./movimentacao.types.js";

class MovimentacaoService {
  public async create(data: ICreateMovimentacaoDTO) {
    const patrimonio = await Patrimonio.findById(data.patrimonioId);

    if (!patrimonio || !patrimonio.ativo) {
      throw new Error("Patrimônio não encontrado.");
    }

    if (data.usuario.perfil !== "administrador" && !data.usuario.secretaria.equals(patrimonio.secretaria)) {
      throw new Error("O usuário não pertence à secretaria do patrimônio.");
    }

    const secretariaAtual = patrimonio.secretaria;
    const salaAtual = patrimonio.sala;

    let dados: IMovimentacao["dados"];

    if (data.tipo === "conferencia") {
      dados = {
        status: data.dados.status,
        estadoConservacao: data.dados.estadoConservacao,
        observacoes: data.dados.observacoes,
      };

      if (data.dados.status) patrimonio.status = data.dados.status;
      if (data.dados.estadoConservacao) patrimonio.estadoConservacao = data.dados.estadoConservacao;
    } else if (data.tipo === "atualizacao_localizacao") {
      const salaDestino = await Sala.findById(data.dados.salaDestino);

      if (!salaDestino) {
        throw new Error("Sala de destino não encontrada.");
      }

      if (!salaDestino.ativa) {
        throw new Error("A sala de destino está inativa.");
      }

      if (salaDestino._id.equals(salaAtual)) {
        throw new Error("O patrimônio já está na sala informada.");
      }

      const mesmaSecretaria = salaDestino.secretaria.equals(secretariaAtual);

      if (!mesmaSecretaria) {
        throw new Error("Para mudar de secretaria, utilize o tipo transferencia.");
      }

      dados = {
        secretariaOrigem: secretariaAtual,
        salaOrigem: salaAtual,
        secretariaDestino: salaDestino.secretaria,
        salaDestino: salaDestino._id,
        motivo: data.dados.motivo,
      };

      patrimonio.sala = salaDestino._id;
      patrimonio.secretaria = salaDestino.secretaria;
    } else {
      const secretariaDestino = await Secretaria.findById(data.dados.secretariaDestino);

      if (!secretariaDestino) {
        throw new Error("Secretaria de destino não encontrada.");
      }

      if (!secretariaDestino.ativa) {
        throw new Error("A secretaria de destino está inativa.");
      }

      if (secretariaDestino._id.equals(secretariaAtual)) {
        throw new Error("A secretaria de destino deve ser diferente da secretaria atual.");
      }

      dados = {
        secretariaOrigem: secretariaAtual,
        salaOrigem: salaAtual,
        secretariaDestino: secretariaDestino._id,
        motivo: data.dados.motivo,
        justificativa: data.dados.justificativa,
      };
    }

    const movimentacao = new Movimentacao({
      usuario: data.usuario._id,
      patrimonio: patrimonio._id,
      tipo: data.tipo,
      secretaria: secretariaAtual,
      sala: salaAtual,
      status: data.tipo === "transferencia" ? "pendente" : "concluida",
      dataHora: new Date(),
      dados,
    });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await movimentacao.save({ session });

      if (data.tipo !== "transferencia") {
        await patrimonio.save({ session });
      }

      await session.commitTransaction();

      return movimentacao;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public async findAll(filtros: any, ordenacao: any) {
    return await Movimentacao.find(filtros)
      .populate("usuario", "nome")
      .populate("patrimonio", "numeroPatrimonio descricao")
      .populate("secretaria", "nome")
      .populate("sala", "nome")
      .populate("dados.salaOrigem", "nome")
      .populate("dados.salaDestino", "nome")
      .populate("dados.secretariaOrigem", "nome")
      .populate("dados.secretariaDestino", "nome")
      .sort(ordenacao);
  }

  public async findByPatrimonio(patrimonioId: Types.ObjectId) {
    return await Movimentacao.find({ patrimonio: patrimonioId }).sort({ dataHora: -1 }).populate("usuario");
  }

  public async findByUsuario(usuarioId: Types.ObjectId) {
    return await Movimentacao.find({ usuario: usuarioId }).sort({ dataHora: -1 }).populate("patrimonio");
  }
}

export default new MovimentacaoService();
