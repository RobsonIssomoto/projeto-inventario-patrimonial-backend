import { Router } from "express";
import usuarioController from "./usuario.controller.js";
import { autenticar, autorizar } from "./usuario.middleware.js";

const usuarioRoutes = Router();

usuarioRoutes.post("/", autenticar, autorizar(["administrador", "gerente"]), usuarioController.create);
usuarioRoutes.get("/", autenticar, autorizar(["administrador", "gerente"]), usuarioController.findAll);
usuarioRoutes.get("/:uid", usuarioController.findById);
usuarioRoutes.put("/:uid", autenticar, autorizar(["administrador", "gerente"]), usuarioController.update);
usuarioRoutes.delete("/:uid", autenticar, autorizar(["administrador", "gerente"]), usuarioController.deactivate);

export default usuarioRoutes;
