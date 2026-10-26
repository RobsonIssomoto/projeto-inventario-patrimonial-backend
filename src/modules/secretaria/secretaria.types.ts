export interface ISecretaria {
  nome: string;
  sigla?: string;
  ativa: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSecretariaDTO {
  nome: string;
  sigla?: string;
}

export interface IUpdateSecretariaDTO {
  nome?: string;
  sigla?: string;
  ativa?: boolean;
}
