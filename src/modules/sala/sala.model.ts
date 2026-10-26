import mongoose, { Schema } from "mongoose";
import type { ISala } from "./sala.types.js";
import Secretaria from "../secretaria/secretaria.model.js";

const salaSchema = new Schema<ISala>(
  {
    nome: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    secretaria: {
      type: Schema.Types.ObjectId,
      ref: Secretaria,
      required: true,
      immutable: true,
      index: true,
    },

    ativa: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

//índice composto único
salaSchema.index({ secretaria: 1, nome: 1 }, { unique: true });

const Sala = mongoose.model<ISala>("Sala", salaSchema);

export default Sala;
