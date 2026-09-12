import type { IUsuario, ICreateUsuarioDTO } from "./usuario.types.js";
import { Usuario } from "./usuario.model.js";

class UsuarioService {
  public async create(data: ICreateUsuarioDTO): Promise<IUsuario> {
    const usuario = new Usuario(data);
    return await usuario.save();
  }

  public async findById(uid: string) {
    return await Usuario.findOne({ uid });
  }
}

export default new UsuarioService();
