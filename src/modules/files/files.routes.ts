import { Router } from "express";
import filesController from "./files.controller.js";
import { uploadFoto } from "./files.middleware.js";
import { autenticar } from "../usuario/usuario.middleware.js";

const filesRoutes = Router();

filesRoutes.use(autenticar);

filesRoutes.post("/patrimonio/:patrimonioId", uploadFoto, filesController.upload);
filesRoutes.get("/patrimonio/:patrimonioId", filesController.findByPatrimonio);
filesRoutes.get("/:id", filesController.download);

export default filesRoutes;
