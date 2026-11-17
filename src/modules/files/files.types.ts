import type { Types } from "mongoose";
import type { IUsuario } from "../usuario/usuario.types.js";

export interface IArquivo {
  patrimonio: Types.ObjectId;
  usuario: Types.ObjectId;
  nomeOriginal: string;
  nomeArquivo: string;
  tipo: string;
  tamanho: number;
  principal: boolean; //true = foto que aparece no card do patrimônio
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateArquivoDTO {
  usuario: IUsuario;
  patrimonioId: string;
  nomeOriginal: string;
  nomeArquivo: string;
  tipo: string;
  tamanho: number;
}
