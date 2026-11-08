import { Types } from "mongoose";
import type { EstadoConservacao, StatusPatrimonio } from "../patrimonio/patrimonio.types.js";
import type { IUsuario } from "../usuario/usuario.types.js";

export type TipoMovimentacao = "conferencia" | "atualizacao_localizacao" | "transferencia";

export interface IMovimentacao {
  usuario: Types.ObjectId;
  patrimonio: Types.ObjectId;
  tipo: TipoMovimentacao;
  secretaria: Types.ObjectId;
  sala: Types.ObjectId;
  dataHora: Date;
  dados: {
    status?: StatusPatrimonio;
    estadoConservacao?: EstadoConservacao;
    observacoes?: string;
    secretariaOrigem?: Types.ObjectId;
    secretariaDestino?: Types.ObjectId;
    salaOrigem?: Types.ObjectId;
    salaDestino?: Types.ObjectId;
    motivo?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateMovimentacaoDTO {
  usuario: IUsuario;
  patrimonioId: string;
  tipo: TipoMovimentacao;
  dados: {
    status?: StatusPatrimonio;
    estadoConservacao?: EstadoConservacao;
    observacoes?: string;
    salaDestino?: string;
    motivo?: string;
  };
}
