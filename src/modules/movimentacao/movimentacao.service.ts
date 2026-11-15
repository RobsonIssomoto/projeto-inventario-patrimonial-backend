import mongoose from "mongoose";
import type { Types } from "mongoose";
import Movimentacao from "./movimentacao.model.js";
import Patrimonio from "../patrimonio/patrimonio.model.js";
import Sala from "../sala/sala.model.js";
import Secretaria from "../secretaria/secretaria.model.js";
import type { IUsuario } from "../usuario/usuario.types.js";
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

    if (data.tipo === "transferencia" && data.usuario.perfil !== "gerente" && data.usuario.perfil !== "administrador") {
      throw new Error("Você não possui permissão para criar transferências entre secretarias.");
    }

    const secretariaAtual = patrimonio.secretaria;
    const salaAtual = patrimonio.sala;

    let dados: IMovimentacao["dados"];

    const transferenciaPendente = await Movimentacao.findOne({
      patrimonio: patrimonio._id,
      tipo: "transferencia",
      status: "pendente",
    });

    if (transferenciaPendente && (data.tipo === "transferencia" || data.tipo === "atualizacao_localizacao")) {
      throw new Error(
        "Não é possível alterar a localização ou criar outra transferência enquanto houver transferência pendente.",
      );
    }

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
      .populate("dados.usuarioDestino", "nome")
      .sort(ordenacao);
  }

  public async findByPatrimonio(patrimonioId: Types.ObjectId) {
    return await Movimentacao.find({ patrimonio: patrimonioId }).sort({ dataHora: -1 }).populate("usuario");
  }

  public async findByUsuario(usuarioId: Types.ObjectId) {
    return await Movimentacao.find({ usuario: usuarioId }).sort({ dataHora: -1 }).populate("patrimonio");
  }

  public async cancel(id: string, usuarioLogado: any) {
    const movimentacao = await Movimentacao.findById(id);

    if (!movimentacao) {
      throw new Error("Movimentação não encontrada.");
    }

    if (movimentacao.tipo !== "transferencia") {
      throw new Error("Apenas transferências pendentes podem ser canceladas.");
    }

    if (movimentacao.status !== "pendente") {
      throw new Error("Apenas transferências pendentes podem ser canceladas.");
    }

    const podeCancelar =
      usuarioLogado.perfil === "administrador" ||
      (usuarioLogado.perfil === "gerente" && usuarioLogado.secretaria.equals(movimentacao.secretaria));

    if (!podeCancelar) {
      throw new Error("Você não possui permissão para cancelar esta transferência.");
    }

    const cancelada = await Movimentacao.findOneAndUpdate(
      {
        _id: movimentacao._id,
        tipo: "transferencia",
        status: "pendente",
      },
      {
        $set: { status: "cancelada" },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!cancelada) {
      throw new Error("Apenas transferências pendentes podem ser canceladas.");
    }

    return cancelada;
  }

  public async findPendingReceipts(usuario: IUsuario) {
    if (usuario.perfil !== "gerente" && usuario.perfil !== "administrador") {
      throw new Error("Você não possui permissão para consultar recebimentos.");
    }

    return this.findAll(
      {
        tipo: "transferencia",
        status: "pendente",
        "dados.secretariaDestino": usuario.secretaria,
      },
      { dataHora: -1 },
    );
  }

  public async receive(id: string, salaDestinoId: string, usuario: IUsuario) {
    if (usuario.perfil !== "gerente" && usuario.perfil !== "administrador") {
      throw new Error("Você não possui permissão para receber esta transferência.");
    }

    const session = await mongoose.startSession();

    try {
      const recebida = await session.withTransaction(async () => {
        const movimentacao = await Movimentacao.findById(id).session(session);

        if (!movimentacao) {
          throw new Error("Movimentação não encontrada.");
        }

        if (movimentacao.tipo !== "transferencia" || movimentacao.status !== "pendente") {
          throw new Error("Apenas transferências pendentes podem ser recebidas.");
        }

        const secretariaDestinoId = movimentacao.dados.secretariaDestino;

        if (!secretariaDestinoId) {
          throw new Error("A transferência não possui secretaria de destino.");
        }

        if (usuario.perfil !== "administrador" && !usuario.secretaria.equals(secretariaDestinoId)) {
          throw new Error("Você não possui permissão para receber esta transferência.");
        }

        const secretariaDestino = await Secretaria.findById(secretariaDestinoId).session(session);

        if (!secretariaDestino || !secretariaDestino.ativa) {
          throw new Error("Secretaria de destino inexistente ou inativa.");
        }

        const salaDestino = await Sala.findById(salaDestinoId).session(session);

        if (!salaDestino || !salaDestino.ativa) {
          throw new Error("Sala de destino inexistente ou inativa.");
        }

        if (!salaDestino.secretaria.equals(secretariaDestinoId)) {
          throw new Error("A sala escolhida não pertence à secretaria de destino.");
        }

        const patrimonio = await Patrimonio.findById(movimentacao.patrimonio).session(session);

        if (!patrimonio || !patrimonio.ativo) {
          throw new Error("Patrimônio não encontrado.");
        }

        if (!patrimonio.secretaria.equals(movimentacao.secretaria) || !patrimonio.sala.equals(movimentacao.sala)) {
          throw new Error("A localização do patrimônio mudou desde a solicitação.");
        }

        patrimonio.secretaria = secretariaDestinoId;
        patrimonio.sala = salaDestino._id;

        movimentacao.status = "recebida";
        movimentacao.dados.salaDestino = salaDestino._id;
        movimentacao.dados.usuarioDestino = usuario._id;
        movimentacao.dados.dataRecebimento = new Date();

        await patrimonio.save({ session });
        await movimentacao.save({ session });

        return movimentacao;
      });

      return recebida;
    } finally {
      await session.endSession();
    }
  }
}

export default new MovimentacaoService();
