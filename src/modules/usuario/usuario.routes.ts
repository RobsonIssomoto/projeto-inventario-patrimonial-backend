import { Router } from "express";
import usuarioController from "./usuario.controller.js";
import { autenticar, autorizar } from "./usuario.middleware.js";

const usuarioRoutes = Router();

usuarioRoutes.post("/", autenticar, autorizar(["gerente", "administrador"]), usuarioController.create);
usuarioRoutes.get("/eu", autenticar, usuarioController.findMe);
usuarioRoutes.get("/:uid", autenticar, autorizar(["gerente", "administrador"]), usuarioController.findById);

export default usuarioRoutes;
