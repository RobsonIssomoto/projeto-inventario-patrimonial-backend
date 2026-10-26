import Sala from "./sala.model.js";
import Secretaria from "../secretaria/secretaria.model.js";
import type { ICreateSalaDTO, IUpdateSalaDTO } from "./sala.types.js";

class SalaService {
  public async create(data: ICreateSalaDTO) {
    const secretaria = await Secretaria.findById(data.secretaria);

    if (!secretaria) {
      throw new Error("Secretaria não encontrada.");
    }

    if (!secretaria.ativa) {
      throw new Error("Não é possível cadastrar sala em uma secretaria inativa.");
    }

    //relaciona a sala à secretaria
    const sala = new Sala({
      nome: data.nome,
      secretaria: secretaria._id,
    });

    return await sala.save();
  }
  public async update(id: string, data: IUpdateSalaDTO) {
    return await Sala.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  public async findAll(filtros: any, ordenacao: any) {
    return await Sala.find(filtros).sort(ordenacao);
  }

  public async findById(id: string) {
    return await Sala.findById(id);
  }

  public async deactivate(id: string) {
    return await Sala.findByIdAndUpdate(id, { ativa: false }, { new: true, runValidators: true });
  }
}

export default new SalaService();
