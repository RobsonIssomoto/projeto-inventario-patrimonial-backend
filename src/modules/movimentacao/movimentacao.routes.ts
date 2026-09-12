import { Router } from "express";
import movimentacaoController from "./movimentacao.controller.js";

const movimentacaoRoutes = Router();

movimentacaoRoutes.post("/", movimentacaoController.create);

export default movimentacaoRoutes;
