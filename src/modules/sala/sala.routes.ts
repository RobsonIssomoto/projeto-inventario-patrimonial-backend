import { Router } from "express";
import salaController from "./sala.controller.js";

const salaRoutes = Router();

salaRoutes.post("/", salaController.create);
salaRoutes.get("/", salaController.findAll);
salaRoutes.get("/:id", salaController.findById);
salaRoutes.put("/:id", salaController.update);
salaRoutes.patch("/:id/desativar", salaController.deactivate);

export default salaRoutes;
