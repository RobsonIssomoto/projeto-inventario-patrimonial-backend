import { Router } from "express";
import patrimonioController from "./patrimonio.controller.js";
import { autenticar } from "../usuario/usuario.middleware.js";

const patrimonioRoutes = Router();

patrimonioRoutes.use(autenticar);

patrimonioRoutes.post("/", autenticar, patrimonioController.create);
patrimonioRoutes.get("/", autenticar, patrimonioController.listar);
patrimonioRoutes.get("/numero/:numero", patrimonioController.findByNumero);
patrimonioRoutes.put("/:id", patrimonioController.update);
patrimonioRoutes.patch("/:id", patrimonioController.update);
patrimonioRoutes.delete("/:id", patrimonioController.deactivate);

export default patrimonioRoutes;
