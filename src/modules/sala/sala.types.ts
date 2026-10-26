import type { Types } from "mongoose";

export interface ISala {
  nome: string;
  secretaria: Types.ObjectId;
  ativa: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSalaDTO {
  nome: string;
  secretaria: string;
}

export interface IUpdateSalaDTO {
  nome?: string;
  ativa?: boolean;
}
