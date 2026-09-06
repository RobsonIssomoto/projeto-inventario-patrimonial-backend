import { Router } from "express";
import patrimonioController from "./patrimonio.controller.js";

const patrimonioRoutes = Router();

patrimonioRoutes.post("/", patrimonioController.create);
patrimonioRoutes.get("/", patrimonioController.listar);
patrimonioRoutes.get("/numero/:numero", patrimonioController.findByNumero);
patrimonioRoutes.put("/:id", patrimonioController.update);
patrimonioRoutes.patch("/:id", patrimonioController.update);
patrimonioRoutes.delete("/:id", patrimonioController.delete);

export default patrimonioRoutes;
