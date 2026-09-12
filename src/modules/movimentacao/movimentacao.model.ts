import mongoose, { Schema } from "mongoose";
import type { IMovimentacao } from "./movimentacao.types.js";

const movimentacaoSchema = new Schema<IMovimentacao>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    patrimonio: {
      type: Schema.Types.ObjectId,
      ref: "Patrimonio",
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: ["conferencia", "atualizacao_localizacao", "transferencia"],
      required: true,
    },
    setor: {
      type: String,
      required: true,
      trim: true,
    },
    sala: {
      type: String,
      required: true,
      trim: true,
    },
    dataHora: {
      type: Date,
      required: true,
      index: true,
    },
    dados: {
      status: {
        type: String,
        enum: ["conferido", "pendente", "nao_localizado"],
      },
      estadoConservacao: {
        type: String,
        enum: ["novo", "bom", "regular", "ruim", "inservivel"],
      },
      observacoes: {
        type: String,
        trim: true,
      },
      setorOrigem: {
        type: String,
      },
      setorDestino: {
        type: String,
      },
      salaOrigem: {
        type: String,
      },
      salaDestino: {
        type: String,
      },
      motivo: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

movimentacaoSchema.index({ patrimonio: 1, dataHora: -1 });

const Movimentacao = mongoose.model<IMovimentacao>("Movimentacao", movimentacaoSchema);

export default Movimentacao;
