import { Router } from "express";
import salaController from "./sala.controller.js";
import { autenticar, autorizar } from "../usuario/usuario.middleware.js";

const salaRoutes = Router();

salaRoutes.use(autenticar);

salaRoutes.post("/", autorizar(["gerente", "administrador"]), salaController.create);
salaRoutes.get("/", salaController.findAll);
salaRoutes.get("/:id", salaController.findById);
salaRoutes.put("/:id", autorizar(["gerente", "administrador"]), salaController.update);
salaRoutes.patch("/:id/desativar", autorizar(["gerente", "administrador"]), salaController.deactivate);

export default salaRoutes;
