import path from "node:path";
import { unlink } from "node:fs/promises";
import { Types } from "mongoose";
import Arquivo from "./files.model.js";
import Patrimonio from "../patrimonio/patrimonio.model.js";
import { ENV } from "../../config/env.js";
import type { ICreateArquivoDTO } from "./files.types.js";
import type { IUsuario } from "../usuario/usuario.types.js";

class FilesService {
  public async create(data: ICreateArquivoDTO) {
    try {
      const patrimonio = await this.buscarPatrimonioDoUsuario(data.patrimonioId, data.usuario);

      if (!patrimonio.ativo) {
        throw new Error("Patrimônio não encontrado.");
      }

      return await Arquivo.create({
        patrimonio: patrimonio._id,
        usuario: data.usuario._id,
        nomeOriginal: data.nomeOriginal,
        nomeArquivo: data.nomeArquivo,
        tipo: data.tipo,
        tamanho: data.tamanho,
      });
    } catch (error) {
      await unlink(path.join(ENV.UPLOADS_DIR, data.nomeArquivo)).catch(() => {});
      throw error;
    }
  }

  public async findByPatrimonio(patrimonioId: string, usuario: IUsuario) {
    const patrimonio = await this.buscarPatrimonioDoUsuario(patrimonioId, usuario);

    return await Arquivo.find({ patrimonio: patrimonio._id }).sort({ createdAt: -1 });
  }

  public async findById(id: string, usuario: IUsuario) {
    const arquivo = await Arquivo.findById(id);

    if (!arquivo) {
      throw new Error("Arquivo não encontrado.");
    }

    await this.buscarPatrimonioDoUsuario(arquivo.patrimonio.toString(), usuario);

    return {
      arquivo,
      caminho: path.join(ENV.UPLOADS_DIR, arquivo.nomeArquivo),
    };
  }

  private async buscarPatrimonioDoUsuario(patrimonioId: string, usuario: IUsuario) {
    if (!Types.ObjectId.isValid(patrimonioId)) {
      throw new Error("ID do patrimônio inválido.");
    }

    const patrimonio = await Patrimonio.findById(patrimonioId);

    if (!patrimonio) {
      throw new Error("Patrimônio não encontrado.");
    }

    if (usuario.perfil !== "administrador" && !usuario.secretaria.equals(patrimonio.secretaria)) {
      throw new Error("Patrimônio não encontrado.");
    }

    return patrimonio;
  }
}

export default new FilesService();
