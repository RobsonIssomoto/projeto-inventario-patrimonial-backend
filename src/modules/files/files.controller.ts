import type { Request, Response } from "express";
import { Types } from "mongoose";
import filesService from "./files.service.js";
import type { ICreateArquivoDTO } from "./files.types.js";

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
}

export default new FilesController();
