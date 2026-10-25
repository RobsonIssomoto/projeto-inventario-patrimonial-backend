import mongoose, { Schema } from "mongoose";
import type { ISecretaria } from "./secretaria.types.js";

const secretariaSchema = new Schema<ISecretaria>(
  {
    nome: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    sigla: {
      type: String,
      trim: true,
      uppercase: true,
    },

    ativa: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Secretaria = mongoose.model<ISecretaria>("Secretaria, secretariaSchema");

export default Secretaria;
