import { Router } from "express";
import patrimonioRoutes from "../modules/patrimonio/patrimonio.routes.js";
import usuarioRoutes from "../modules/usuario/usuario.routes.js";
import movimentacaoRoutes from "../modules/movimentacao/movimentacao.routes.js";

const routes = Router();

routes.get("/teste", (request, response) => {
  return response.status(200).json({
    message: "Endpoint de teste funcionando",
  });
});

routes.use("/patrimonios", patrimonioRoutes);
routes.use("/usuario", usuarioRoutes);
routes.use("/movimentacoes", movimentacaoRoutes);
export default routes;
