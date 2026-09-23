import mongoose, { Schema } from "mongoose";
import type { IPatrimonio } from "./patrimonio.types.js";

const patrimonioSchema = new Schema<IPatrimonio>(
  {
    numeroPatrimonio: {
      type: String,
      required: [true, "O número do patrimônio é obrigatório"],
      unique: true,
      trim: true,
      index: true,
    },
    descricao: {
      type: String,
      required: [true, "A descrição do item é obrigatória"],
      trim: true,
    },
    secretaria: {
      type: String,
      required: [true, "A secretaria responsável é obrigatória"],
      trim: true,
      index: true,
    },
    sala: {
      type: String,
      required: [true, "A sala/localização física é obrigatória"],
      trim: true,
    },
    categoria: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["conferido", "pendente", "nao_localizado"],
      default: "pendente",
      index: true,
    },
    estadoConservacao: {
      type: String,
      enum: ["novo", "bom", "regular", "ruim", "inservivel"],
      default: "bom",
    },
    observacoes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Patrimonio = mongoose.model<IPatrimonio>("Patrimonio", patrimonioSchema);

export default Patrimonio;
