import type { Request, Response } from "express";
import patrimonioService from "./patrimonio.service.js";
import type { ICreatePatrimonioDTO, IUpdatePatrimonioDTO } from "./patrimonio.types.js";

class PatrimonioController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { numeroPatrimonio, descricao, setor, sala, tipoObjeto, status, estadoConservacao, observacoes } =
        request.body;

      if (!numeroPatrimonio || typeof numeroPatrimonio !== "string") {
        return response.status(400).json({ erro: "O número do patrimônio é obrigatório." });
      }

      if (!descricao || typeof descricao !== "string" || descricao.trim().length < 3) {
        return response.status(400).json({ erro: "A descrição é obrigatória e deve ter no mínimo 3 caracteres." });
      }

      if (!setor || typeof setor !== "string") {
        return response.status(400).json({ erro: "O setor é obrigatório." });
      }

      if (!sala || typeof sala !== "string") {
        return response.status(400).json({ erro: "A sala é obrigatória." });
      }

      const dadosValidados: ICreatePatrimonioDTO = {
        numeroPatrimonio: numeroPatrimonio.trim(),
        descricao: descricao.trim(),
        setor: setor.trim(),
        sala: sala.trim(),
        tipoObjeto,
        status,
        estadoConservacao,
        observacoes,
      };

      const novoPatrimonio = await patrimonioService.create(dadosValidados);

      return response.status(201).json({
        mensagem: "Patrimônio cadastrado com sucesso!",
        dados: novoPatrimonio,
      });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        return response.status(400).json({ erro: "Número de patrimônio já cadastrado no sistema." });
      }

      console.error("Erro interno no Controller de Patrimônio ao criar.", error);
      return response.status(500).json({ erro: "Erro interno no servidor." });
    }
  }

  public async listar(request: Request, response: Response): Promise<Response> {
    try {
      const { busca, setor, sala, tipoObjeto, status, ordenarPor } = request.query;

      const filtros: Record<string, any> = {};

      if (busca) {
        filtros.$or = [
          { numeroPatrimonio: { $regex: String(busca), $options: "i" } },
          { descricao: { $regex: String(busca), $options: "i" } },
        ];
      }

      if (setor) filtros.setor = String(setor);
      if (sala) filtros.sala = String(sala);
      if (tipoObjeto) filtros.tipoObjeto = String(tipoObjeto);
      if (status) filtros.status = String(status);

      let ordenacao: Record<string, 1 | -1> = { createdAt: -1 };

      if (ordenarPor === "antigos") {
        ordenacao = { createdAt: 1 };
      } else if (ordenarPor === "numero") {
        ordenacao = { numeroPatrimonio: 1 };
      }

      const patrimonios = await patrimonioService.findAll(filtros, ordenacao);
      return response.status(200).json(patrimonios);
    } catch (error) {
      console.error("Erro ao listar patrimônios.", error);
      return response.status(500).json({ erro: "Erro interno no servidor." });
    }
  }

  public async findByNumero(request: Request, response: Response): Promise<Response> {
    try {
      const { numero } = request.params;

      if (!numero || typeof numero !== "string") {
        return response.status(400).json({ erro: "Número de patrimônio inválido." });
      }

      const patrimonio = await patrimonioService.findByNumero(numero);

      if (!patrimonio) {
        return response.status(404).json({ erro: "Patrimônio não localizado no sistema." });
      }

      return response.status(200).json(patrimonio);
    } catch (error) {
      console.error("Erro ao buscar patrimônio por número.", error);
      return response.status(500).json({ erro: "Erro interno no servidor." });
    }
  }

  public async update(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;
      const dadosAtualizacao: IUpdatePatrimonioDTO = request.body ?? {};

      if (!id || typeof id !== "string") {
        return response.status(400).json({ erro: "ID inválido." });
      }

      const patrimonioAtualizado = await patrimonioService.update(id, dadosAtualizacao);

      if (!patrimonioAtualizado) {
        return response.status(404).json({ erro: "Patrimônio não encontrado para atualização." });
      }

      return response.status(200).json({
        mensagem: "Patrimônio atualizado com sucesso.",
        dados: patrimonioAtualizado,
      });
    } catch (error) {
      console.error("Erro ao atualizar patrimônio.", error);
      return response.status(500).json({ erro: "Erro interno no servidor." });
    }
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      if (!id || typeof id !== "string") {
        return response.status(400).json({ erro: "ID inválido." });
      }

      const patrimonioDeletado = await patrimonioService.delete(id);

      if (!patrimonioDeletado) {
        return response.status(404).json({ erro: "Patrimônio não encontrado para exclusão." });
      }

      return response.status(200).json({ mensagem: "Patrimônio excluído com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir patrimônio.", error);
      return response.status(500).json({ erro: "Erro interno no servidor." });
    }
  }
}

export default new PatrimonioController();
