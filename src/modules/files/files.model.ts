import mongoose, { Schema } from "mongoose";
import type { IArquivo } from "./files.types.js";

const arquivoSchema = new Schema<IArquivo>(
  {
    patrimonio: {
      type: Schema.Types.ObjectId,
      ref: "Patrimonio",
      required: true,
      index: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    nomeOriginal: {
      type: String,
      required: true,
      trim: true,
    },
    nomeArquivo: {
      type: String,
      required: true,
      unique: true,
    },
    tipo: {
      type: String,
      required: true,
    },
    tamanho: {
      type: Number,
      required: true,
    },
    //apenas uma foto por patrimônio fica com principal = true
    principal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Arquivo = mongoose.model<IArquivo>("Arquivo", arquivoSchema);

export default Arquivo;
