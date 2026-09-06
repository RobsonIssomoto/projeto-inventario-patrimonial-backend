// src/modules/patrimonio/patrimonio.types.ts
export type StatusPatrimonio = "conferido" | "pendente" | "nao_localizado";
export type EstadoConservacao = "novo" | "bom" | "regular" | "ruim" | "inservivel";

export interface IPatrimonio {
  numeroPatrimonio: string;
  descricao: string;
  setor: string;
  sala: string;
  tipoObjeto?: string;
  status: StatusPatrimonio;
  estadoConservacao: EstadoConservacao;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreatePatrimonioDTO {
  numeroPatrimonio: string;
  descricao: string;
  setor: string;
  sala: string;
  tipoObjeto?: string;
  status?: StatusPatrimonio;
  estadoConservacao?: EstadoConservacao;
  observacoes?: string;
}

export interface IUpdatePatrimonioDTO {
  descricao?: string;
  setor?: string;
  sala?: string;
  tipoObjeto?: string;
  status?: StatusPatrimonio;
  estadoConservacao?: EstadoConservacao;
  observacoes?: string;
}
