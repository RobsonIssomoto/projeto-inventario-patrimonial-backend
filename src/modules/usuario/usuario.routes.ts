import { Router } from "express";
import usuarioController from "./usuario.controller.js";

const usuarioRoutes = Router();

usuarioRoutes.post("/", usuarioController.create);
usuarioRoutes.get("/:uid", usuarioController.findById);

export default usuarioRoutes;
