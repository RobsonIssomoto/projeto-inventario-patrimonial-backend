import type { Types } from "mongoose";
import Movimentacao from "./movimentacao.model.js";
import type { ICreateMovimentacaoDTO } from "./movimentacao.types.js";

class MovimentacaoService {
  public async create(data: ICreateMovimentacaoDTO) {
    const movimentacao = new Movimentacao(data);
    return await movimentacao.save();
  }

  public async findAll(filtros: any, ordenacao: any) {
    return await Movimentacao.find(filtros).sort(ordenacao);
  }

  public async findByPatrimonio(patrimonioId: Types.ObjectId) {
    return await Movimentacao.find({ patrimonio: patrimonioId }).sort({ dataHora: -1 }).populate("usuario");
  }

  public async findByUsuario(usuarioId: Types.ObjectId) {
    return await Movimentacao.find({ usuario: usuarioId }).sort({ dataHora: -1 }).populate("patrimonio");
  }
}

export default new MovimentacaoService();
