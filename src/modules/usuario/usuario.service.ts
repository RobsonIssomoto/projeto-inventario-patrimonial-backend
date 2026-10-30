import type { IUsuario, ICreateUsuarioDTO } from "./usuario.types.js";
import { Usuario } from "./usuario.model.js";
import { firebaseAuth } from "../../config/firebase.js";
import { Types } from "mongoose";
import Secretaria from "../secretaria/secretaria.model.js";

class UsuarioService {
  public async create(data: ICreateUsuarioDTO): Promise<{ usuario: IUsuario; linkDefinicaoSenha: string }> {
    const secretaria = await this.validarSecretaria(data.secretaria);

    const usuarioFirebase = await firebaseAuth.createUser({
      email: data.email,
      emailVerified: false,
      disabled: false,
    });

    const usuario = await Usuario.create({
      uid: usuarioFirebase.uid,
      nome: data.nome,
      email: data.email,
      secretaria: secretaria._id,
      perfil: data.perfil,
      ativo: data.ativo ?? true,
    });

    const linkDefinicaoSenha = await firebaseAuth.generatePasswordResetLink(data.email);

    return {
      usuario,
      linkDefinicaoSenha,
    };
  }

  public async findById(uid: string) {
    return await Usuario.findOne({ uid });
  }

  private async validarSecretaria(secretariaId: string) {
    if (!Types.ObjectId.isValid(secretariaId)) {
      throw new Error("ID da secretaria inválido.");
    }

    const secretaria = await Secretaria.findById(secretariaId);

    if (!secretaria) {
      throw new Error("Secretaria não encontrada.");
    }

    if (!secretaria.ativa) {
      throw new Error("Não é possível cadastrar usuário em uma secretaria inativa.");
    }

    return secretaria;
  }
}

export default new UsuarioService();
