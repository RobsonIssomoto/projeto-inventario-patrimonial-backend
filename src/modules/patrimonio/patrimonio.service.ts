import Patrimonio from "./patrimonio.model.js";
import type { ICreatePatrimonioDTO, IUpdatePatrimonioDTO } from "./patrimonio.types.js";

class PatrimonioService {
  public async create(data: ICreatePatrimonioDTO) {
    const patrimonio = new Patrimonio(data);
    return await patrimonio.save();
  }

  public async findAll(filtros: any, ordenacao: any) {
    return await Patrimonio.find(filtros).sort(ordenacao);
  }

  public async findByNumero(numeroPatrimonio: string) {
    return await Patrimonio.findOne({ numeroPatrimonio });
  }

  public async update(id: string, data: IUpdatePatrimonioDTO) {
    return await Patrimonio.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  public async delete(id: string) {
    return await Patrimonio.findByIdAndDelete(id);
  }
}

export default new PatrimonioService();
