import { Router } from "express";
import secretariaController from "./secretaria.controller.js";
import { autenticar, autorizar } from "../usuario/usuario.middleware.js";

const secretariaRoutes = Router();

secretariaRoutes.use(autenticar);

secretariaRoutes.post("/", autorizar(["administrador"]), secretariaController.create);
secretariaRoutes.get("/", secretariaController.findAll);
secretariaRoutes.get("/:id", secretariaController.findById);
secretariaRoutes.put("/:id", autorizar(["administrador"]), secretariaController.update);

export default secretariaRoutes;
