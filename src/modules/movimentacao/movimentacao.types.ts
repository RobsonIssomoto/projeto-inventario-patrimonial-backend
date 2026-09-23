import { Types } from "mongoose";
import type { EstadoConservacao, StatusPatrimonio } from "../patrimonio/patrimonio.types.js";

export type TipoMovimentacao = "conferencia" | "atualizacao_localizacao" | "transferencia";

export interface IMovimentacao {
  usuario: Types.ObjectId;
  patrimonio: Types.ObjectId;
  tipo: TipoMovimentacao;
  secretaria: string;
  sala: string;
  dataHora: Date;
  dados: {
    status?: StatusPatrimonio;
    estadoConservacao?: EstadoConservacao;
    observacoes?: string;
    secretariaOrigem?: string;
    secretariaDestino?: string;
    salaOrigem?: string;
    salaDestino?: string;
    motivo?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateMovimentacaoDTO {
  usuario: Types.ObjectId;
  patrimonio: Types.ObjectId;
  tipo: TipoMovimentacao;
  secretaria: string;
  sala: string;
  dataHora: Date;
  dados: {
    status?: StatusPatrimonio;
    estadoConservacao?: EstadoConservacao;
    observacoes?: string;
    secretariaOrigem?: string;
    secretariaDestino?: string;
    salaOrigem?: string;
    salaDestino?: string;
    motivo?: string;
  };
}
