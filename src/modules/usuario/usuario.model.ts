import mongoose, { Schema } from "mongoose";
import type { IUsuario } from "./usuario.types.js";

const usuarioSchema = new Schema<IUsuario>(
  {
    uid: {
      type: String,
      required: [true, "O id do Firebase é obrigatório"],
      unique: true,
      trim: true,
    },
    nome: {
      type: String,
      required: [true, "O nome do usuário é obrigatório"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      trim: true,
    },
    setor: {
      type: String,
      required: [true, "O setor é obrigatório"],
    },
    perfil: {
      type: String,
      enum: ["operador", "administrador"],
      default: "operador",
      trim: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Usuario = mongoose.model<IUsuario>("Usuario", usuarioSchema);
