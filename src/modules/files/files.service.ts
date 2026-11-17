import path from "node:path";
import { unlink } from "node:fs/promises";
import { Types } from "mongoose";
import Arquivo from "./files.model.js";
import Patrimonio from "../patrimonio/patrimonio.model.js";
import { ENV } from "../../config/env.js";
import type { ICreateArquivoDTO } from "./files.types.js";
import type { IUsuario } from "../usuario/usuario.types.js";

//quantidade máxima de fotos por patrimônio
export const LIMITE_FOTOS = 3;

class FilesService {
  //Salva os dados da foto no banco.
  //O arquivo em si já foi gravado na pasta de uploads pelo multer (files.middleware.ts).
  public async create(data: ICreateArquivoDTO) {
    try {
      const patrimonio = await this.buscarPatrimonioDoUsuario(data.patrimonioId, data.usuario);

      if (!patrimonio.ativo) {
        throw new Error("Patrimônio não encontrado.");
      }

      //regra: no máximo 3 fotos por patrimônio
      const quantidadeAtual = await Arquivo.countDocuments({ patrimonio: patrimonio._id });

      if (quantidadeAtual >= LIMITE_FOTOS) {
        throw new Error(`Limite de ${LIMITE_FOTOS} fotos por patrimônio atingido.`);
      }

      //a primeira foto enviada vira a principal automaticamente
      const ehPrimeiraFoto = quantidadeAtual === 0;

      const arquivo = await Arquivo.create({
        patrimonio: patrimonio._id,
        usuario: data.usuario._id,
        nomeOriginal: data.nomeOriginal,
        nomeArquivo: data.nomeArquivo,
        tipo: data.tipo,
        tamanho: data.tamanho,
        principal: ehPrimeiraFoto,
      });

      if (ehPrimeiraFoto) {
        patrimonio.fotoPrincipal = arquivo._id;
        await patrimonio.save();
      }

      return arquivo;
    } catch (error) {
      //se algo deu errado, apaga o arquivo que o multer já tinha gravado no disco
      await unlink(path.join(ENV.UPLOADS_DIR, data.nomeArquivo)).catch(() => {});
      throw error;
    }
  }

  //Lista as fotos de um patrimônio: a principal primeiro, depois as mais recentes.
  public async findByPatrimonio(patrimonioId: string, usuario: IUsuario) {
    const patrimonio = await this.buscarPatrimonioDoUsuario(patrimonioId, usuario);

    return await Arquivo.find({ patrimonio: patrimonio._id }).sort({ principal: -1, createdAt: -1 });
  }

  //Busca uma foto para download, conferindo se o usuário pode ver o patrimônio dela.
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

  //Escolhe qual foto aparece no card do patrimônio.
  public async definirPrincipal(id: string, usuario: IUsuario) {
    const { arquivo } = await this.findById(id, usuario);

    //1. tira a marcação de principal de todas as fotos do patrimônio
    await Arquivo.updateMany({ patrimonio: arquivo.patrimonio }, { principal: false });

    //2. marca a foto escolhida
    arquivo.principal = true;
    await arquivo.save();

    //3. guarda no patrimônio, para a lista mostrar a foto sem precisar buscar todas
    await Patrimonio.updateOne({ _id: arquivo.patrimonio }, { fotoPrincipal: arquivo._id });

    return arquivo;
  }

  //Exclui uma foto (registro no banco + arquivo no disco).
  public async remover(id: string, usuario: IUsuario) {
    const { arquivo, caminho } = await this.findById(id, usuario);
    const eraPrincipal = arquivo.principal;
    const patrimonioId = arquivo.patrimonio;

    await arquivo.deleteOne();
    await unlink(caminho).catch(() => {});

    //se a foto excluída era a principal, a foto mais recente que sobrou assume o lugar
    if (eraPrincipal) {
      const proxima = await Arquivo.findOne({ patrimonio: patrimonioId }).sort({ createdAt: -1 });

      if (proxima) {
        proxima.principal = true;
        await proxima.save();
      }

      await Patrimonio.updateOne({ _id: patrimonioId }, { fotoPrincipal: proxima ? proxima._id : null });
    }
  }

  //Confere se o patrimônio existe e se o usuário pode acessá-lo
  //(administrador vê tudo; os demais, só a própria secretaria).
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
