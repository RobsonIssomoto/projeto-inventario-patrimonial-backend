import { Router } from "express";
import usuarioController from "./usuario.controller.js";
import { autenticar, autorizar } from "./usuario.middleware.js";

const usuarioRoutes = Router();

usuarioRoutes.post("/", autenticar, autorizar(["administrador", "gerente"]), usuarioController.create);
usuarioRoutes.get("/:uid", usuarioController.findById);

export default usuarioRoutes;
