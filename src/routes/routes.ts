import { Router } from "express";
//import usuarioRoutes from "../modules/usuario/usuario.routes.js";
//import habilidadeRoutes from "../modules/habilidade/habilidade.routes.js";

const router = Router();

router.get("/teste", (request, response) => {
  return response.status(200).json({
    message: "Endpoint de teste funcionando",
  });
});

//router.use("/usuarios", usuarioRoutes);
//router.use("/habilidades", habilidadeRoutes);

export default router;
