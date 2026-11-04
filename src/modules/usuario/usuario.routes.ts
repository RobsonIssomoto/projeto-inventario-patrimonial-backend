import { Router } from "express";
import usuarioController from "./usuario.controller.js";
import { autenticar, autorizar } from "./usuario.middleware.js";

const usuarioRoutes = Router();

usuarioRoutes.post("/", autenticar, autorizar(["gerente", "administrador"]), usuarioController.create);
usuarioRoutes.get("/:uid", autenticar, usuarioController.findById);

export default usuarioRoutes;
