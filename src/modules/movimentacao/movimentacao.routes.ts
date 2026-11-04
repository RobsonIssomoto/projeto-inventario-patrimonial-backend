import { Router } from "express";
import movimentacaoController from "./movimentacao.controller.js";
import { autenticar } from "../usuario/usuario.middleware.js";

const movimentacaoRoutes = Router();

movimentacaoRoutes.use(autenticar);

movimentacaoRoutes.post("/", movimentacaoController.create);
movimentacaoRoutes.get("/", movimentacaoController.findAll);

export default movimentacaoRoutes;
