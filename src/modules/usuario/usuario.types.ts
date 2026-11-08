import { Types } from "mongoose";
export type PerfilUsuario = "operador" | "gerente" | "administrador";

export interface IUsuario {
  _id: Types.ObjectId;
  uid: string;
  nome: string;
  email: string;
  secretaria: Types.ObjectId;
  perfil: PerfilUsuario;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateUsuarioDTO {
  nome: string;
  email: string;
  secretaria: string;
  perfil: PerfilUsuario;
  ativo?: boolean;
}

export interface IUpdateUsuarioDTO {
  nome?: string;
  secretaria?: string;
  perfil?: PerfilUsuario;
  ativo?: boolean;
}
