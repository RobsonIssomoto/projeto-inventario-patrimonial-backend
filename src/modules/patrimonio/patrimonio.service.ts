import { Types } from "mongoose";
import Sala from "../sala/sala.model.js";
import Secretaria from "../secretaria/secretaria.model.js";
import Patrimonio from "../patrimonio/patrimonio.model.js";
import Movimentacao from "../movimentacao/movimentacao.model.js";
import type { ICreatePatrimonioDTO, IUpdatePatrimonioDTO } from "./patrimonio.types.js";

class PatrimonioService {
  public async create(data: ICreatePatrimonioDTO) {
    const secretaria = await Secretaria.findById(data.secretaria);

    if (!secretaria) {
      throw new Error("Secretaria não encontrada.");
    }

    if (!secretaria.ativa) {
      throw new Error("Não é possível cadastrar patrimônio em uma secretaria inativa.");
    }

    const sala = await Sala.findById(data.sala);

    if (!sala) {
      throw new Error("Sala não encontrada");
    }

    if (!sala.ativa) {
      throw new Error("Não é possível cadastrar patrimônio em uma sala inativa.");
    }

    if (sala.secretaria.toString() !== data.secretaria) {
      throw new Error("A sala informada não pertence à secretaria informada.");
    }

    //relaciona o patrimônio à sala e à secretaria
    const patrimonio = new Patrimonio({
      numeroPatrimonio: data.numeroPatrimonio,
      descricao: data.descricao,
      categoria: data.categoria,
      observacoes: data.observacoes,
      sala: sala._id,
      secretaria: secretaria._id,
    });

    return await patrimonio.save();
  }
  public async findById(id: string) {
    return Patrimonio.findById(id).exec();
  }

  public async findAll(filtros: any, ordenacao: any) {
    return await Patrimonio.find(filtros).populate("sala", "nome").populate("secretaria", "nome").sort(ordenacao);
  }

  public async findByNumero(numeroPatrimonio: string) {
    return await Patrimonio.findOne({
      numeroPatrimonio: numeroPatrimonio.trim(),
    })
      .populate("sala", "nome")
      .populate("secretaria", "nome");
  }

  public async update(id: string, data: IUpdatePatrimonioDTO, usuarioId: string) {
    const patrimonio = await Patrimonio.findById(id);

    if (!patrimonio) {
      throw new Error("Patrimônio não encontrado para atualização.");
    }

    const dadosPermitidos: IUpdatePatrimonioDTO = {};

    if (data.descricao !== undefined) {
      dadosPermitidos.descricao = data.descricao.trim();
    }

    if (data.categoria !== undefined) {
      dadosPermitidos.categoria = data.categoria?.trim();
    }

    if (data.status !== undefined) {
      dadosPermitidos.status = data.status;
    }

    if (data.estadoConservacao !== undefined) {
      dadosPermitidos.estadoConservacao = data.estadoConservacao;
    }

    if (data.observacoes !== undefined) {
      dadosPermitidos.observacoes = data.observacoes?.trim();
    }

    if (data.sala !== undefined) {
      if (!Types.ObjectId.isValid(data.sala)) {
        throw new Error("ID da sala inválido.");
      }

      const salaDestino = await Sala.findById(data.sala);

      if (!salaDestino) {
        throw new Error("Sala não encontrada.");
      }

      if (!salaDestino.ativa) {
        throw new Error("Não é possível mover o patrimônio para uma sala inativa.");
      }

      if (salaDestino.secretaria.toString() !== patrimonio.secretaria.toString()) {
        throw new Error("A sala informada não pertence à secretaria do patrimônio.");
      }

      if (salaDestino._id.toString() === patrimonio.sala.toString()) {
        throw new Error("A sala informada já é a sala atual do patrimônio.");
      }

      dadosPermitidos.sala = data.sala;
    }

    if (Object.keys(dadosPermitidos).length === 0) {
      throw new Error("Nenhum campo válido foi informado para atualização.");
    }

    // Se a sala foi alterada, cria uma movimentação
    const patrimonioAtualizado = await Patrimonio.findByIdAndUpdate(id, dadosPermitidos, {
      new: true,
      runValidators: true,
    });

    if (data.sala !== undefined && patrimonioAtualizado) {
      await Movimentacao.create({
        usuario: usuarioId,
        patrimonio: patrimonio._id,
        tipo: "atualizacao_localizacao",
        secretaria: patrimonio.secretaria,
        sala: data.sala,
        dataHora: new Date(),
        dados: {
          salaOrigem: patrimonio.sala,
          salaDestino: data.sala,
          motivo: "Troca de sala",
        },
      });
    }
    return patrimonioAtualizado;
  }

  public async deactivate(id: string) {
    return await Patrimonio.findByIdAndUpdate(id, { ativo: false }, { new: true, runValidators: true });
  }
}

export default new PatrimonioService();
