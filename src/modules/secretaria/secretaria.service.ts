import type { Types } from "mongoose";
import Secretaria from "./secretaria.model.js";
import type { ISecretaria, ICreateSecretariaDTO, IUpdateSecretariaDTO } from "./secretaria.types.js";

class SecretariaService {
  public async create(data: ICreateSecretariaDTO) {
    const secretaria = new Secretaria(data);
    return await secretaria.save();
  }

  public async update(id: string, data: IUpdateSecretariaDTO) {
    return await Secretaria.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  public async findAll(filtros: any, ordenacao: any) {
    return await Secretaria.find(filtros).sort(ordenacao);
  }

  public async findById(id: string) {
    return await Secretaria.findById(id);
  }

  public async delete(id: string) {
    return await Secretaria.findByIdAndDelete(id);
  }
}

export default new SecretariaService();
