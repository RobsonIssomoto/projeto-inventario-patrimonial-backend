import { Router } from "express";
import movimentacaoController from "./movimentacao.controller.js";

const movimentacaoRoutes = Router();

movimentacaoRoutes.post("/", movimentacaoController.create);
movimentacaoRoutes.get("/", movimentacaoController.findAll);

export default movimentacaoRoutes;
