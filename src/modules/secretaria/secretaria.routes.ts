import { Router } from "express";
import secretariaController from "./secretaria.controller.js";

const secretariaRoutes = Router();

secretariaRoutes.post("/", secretariaController.create);
secretariaRoutes.get("/", secretariaController.findAll);
secretariaRoutes.get("/:id", secretariaController.findById);
secretariaRoutes.put("/:id", secretariaController.update);
secretariaRoutes.delete("/:id", secretariaController.deactivate);

export default secretariaRoutes;
