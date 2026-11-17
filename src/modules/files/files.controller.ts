import type { Request, Response } from "express";
import { Types } from "mongoose";
import filesService from "./files.service.js";
import type { ICreateArquivoDTO } from "./files.types.js";
import type { IUsuario } from "../usuario/usuario.types.js";

class FilesController {
  public async upload(request: Request, response: Response): Promise<Response> {
    try {
      const { patrimonioId } = request.params;

      const usuarioLogado = request.usuario;

      if (!usuarioLogado) {
        return response.status(401).json({
          erro: "Usuário não autenticado.",
        });
      }

      if (!request.file) {
        return response.status(400).json({
          erro: "A foto é obrigatória. Envie-a no campo 'foto' do form-data.",
        });
      }

      const dadosValidados: ICreateArquivoDTO = {
        usuario: usuarioLogado,
        patrimonioId: String(patrimonioId),
        nomeOriginal: request.file.originalname,
        nomeArquivo: request.file.filename,
        tipo: request.file.mimetype,
        tamanho: request.file.size,
      };

      const novoArquivo = await filesService.create(dadosValidados);

      return response.status(201).json({
        mensagem: "Foto enviada com sucesso!",
        dados: novoArquivo,
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message === "ID do patrimônio inválido." || error.message.startsWith("Limite de"))
      ) {
        return response.status(400).json({
          erro: error.message,
        });
      }

      if (error instanceof Error && error.message === "Patrimônio não encontrado.") {
        return response.status(404).json({
          erro: error.message,
        });
      }

      console.error("Erro ao enviar foto.", error);

      return response.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }

  public async findByPatrimonio(request: Request, response: Response): Promise<Response> {
    try {
      const { patrimonioId } = request.params;

      const usuarioLogado = request.usuario;

      if (!usuarioLogado) {
        return response.status(401).json({
          erro: "Usuário não autenticado.",
        });
      }

      const arquivos = await filesService.findByPatrimonio(String(patrimonioId), usuarioLogado);

      return response.status(200).json(arquivos);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "ID do patrimônio inválido.") {
        return response.status(400).json({
          erro: error.message,
        });
      }

      if (error instanceof Error && error.message === "Patrimônio não encontrado.") {
        return response.status(404).json({
          erro: error.message,
        });
      }

      console.error("Erro ao listar fotos do patrimônio.", error);

      return response.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }

  public async download(request: Request, response: Response): Promise<Response | void> {
    try {
      const { id } = request.params;

      if (!id || typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return response.status(400).json({
          erro: "ID do arquivo inválido.",
        });
      }

      const usuarioLogado = request.usuario;

      if (!usuarioLogado) {
        return response.status(401).json({
          erro: "Usuário não autenticado.",
        });
      }

      const { caminho } = await filesService.findById(id, usuarioLogado);

      return response.sendFile(caminho, (error) => {
        if (error && !response.headersSent) {
          response.status(404).json({
            erro: "Arquivo não encontrado no servidor.",
          });
        }
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message === "Arquivo não encontrado." || error.message === "Patrimônio não encontrado.")
      ) {
        return response.status(404).json({
          erro: "Arquivo não encontrado.",
        });
      }

      console.error("Erro ao baixar arquivo.", error);

      return response.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }

  //PATCH /arquivos/:id/principal -> escolhe a foto que aparece no card
  public async definirPrincipal(request: Request, response: Response): Promise<Response> {
    return await responderAcaoNaFoto(request, response, async (id, usuario) => {
      const arquivo = await filesService.definirPrincipal(id, usuario);

      return response.status(200).json({
        mensagem: "Foto principal definida com sucesso!",
        dados: arquivo,
      });
    });
  }

  //DELETE /arquivos/:id -> exclui a foto
  public async remover(request: Request, response: Response): Promise<Response> {
    return await responderAcaoNaFoto(request, response, async (id, usuario) => {
      await filesService.remover(id, usuario);

      return response.status(200).json({
        mensagem: "Foto excluída com sucesso!",
      });
    });
  }
}

//Validações e tratamento de erro iguais para "definir principal" e "remover":
//confere o ID e o login, executa a ação e converte os erros conhecidos em status HTTP.
async function responderAcaoNaFoto(
  request: Request,
  response: Response,
  acao: (id: string, usuario: IUsuario) => Promise<Response>,
): Promise<Response> {
  try {
    const { id } = request.params;

    if (!id || typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      return response.status(400).json({
        erro: "ID do arquivo inválido.",
      });
    }

    const usuarioLogado = request.usuario;

    if (!usuarioLogado) {
      return response.status(401).json({
        erro: "Usuário não autenticado.",
      });
    }

    return await acao(id, usuarioLogado);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message === "Arquivo não encontrado." || error.message === "Patrimônio não encontrado.")
    ) {
      return response.status(404).json({
        erro: "Arquivo não encontrado.",
      });
    }

    console.error("Erro ao alterar foto.", error);

    return response.status(500).json({
      erro: "Erro interno no servidor.",
    });
  }
}

export default new FilesController();
