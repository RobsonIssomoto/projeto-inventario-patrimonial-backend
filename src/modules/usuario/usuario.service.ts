import type { IUsuario, ICreateUsuarioDTO } from "./usuario.types.js";
import { Usuario } from "./usuario.model.js";
import { firebaseAuth } from "../../config/firebase.js";
import { Types } from "mongoose";
import Secretaria from "../secretaria/secretaria.model.js";

class UsuarioService {
  public async create(data: ICreateUsuarioDTO): Promise<{ usuario: IUsuario; linkDefinicaoSenha: string; emailEnviado: boolean }> {
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

    //o Admin SDK só gera o link; o envio do e-mail é feito pela API REST do Firebase
    const emailEnviado = await this.enviarEmailDefinicaoSenha(data.email);

    return {
      usuario,
      linkDefinicaoSenha,
      emailEnviado,
    };
  }

  //pede ao Firebase para enviar o e-mail de definição de senha (modelo "Redefinição de senha"
  //configurado no console do Firebase). Retorna false se não houver chave ou se o envio falhar.
  private async enviarEmailDefinicaoSenha(email: string): Promise<boolean> {
    const chaveApiWeb = process.env.FIREBASE_WEB_API_KEY;

    if (!chaveApiWeb) {
      console.warn("FIREBASE_WEB_API_KEY não configurada: e-mail de definição de senha não enviado.");
      return false;
    }

    try {
      const resposta = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${chaveApiWeb}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
        },
      );

      if (!resposta.ok) {
        const erro = await resposta.json().catch(() => null);
        console.error("Falha ao enviar e-mail de definição de senha:", erro?.error?.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Falha ao enviar e-mail de definição de senha:", error);
      return false;
    }
  }

  public async findById(uid: string) {
    return await Usuario.findOne({ uid });
  }

  public async findMe(usuarioLogado: IUsuario) {
    const usuario = await Usuario.findOne({ uid: usuarioLogado.uid }).populate("secretaria", "nome");

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }
    return usuario;
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
