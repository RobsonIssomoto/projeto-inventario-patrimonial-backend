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
    secretaria: {
      type: Schema.Types.ObjectId,
      ref: "Secretaria",
      required: true,
      index: true,
    },
    sala: {
      type: Schema.Types.ObjectId,
      ref: "Sala",
      required: true,
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
      secretariaOrigem: {
        type: Schema.Types.ObjectId,
        ref: "Secretaria",
      },
      secretariaDestino: {
        type: Schema.Types.ObjectId,
        ref: "Secretaria",
      },
      salaOrigem: {
        type: Schema.Types.ObjectId,
        ref: "Sala",
      },
      salaDestino: {
        type: Schema.Types.ObjectId,
        ref: "Sala",
      },
      motivo: {
        type: String,
        trim: true,
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
