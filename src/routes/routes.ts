import { Router } from "express";
import salaRoutes from "../modules/sala/sala.routes.js";
import secretariaRoutes from "../modules/secretaria/secretaria.routes.js";
import patrimonioRoutes from "../modules/patrimonio/patrimonio.routes.js";
import usuarioRoutes from "../modules/usuario/usuario.routes.js";
import movimentacaoRoutes from "../modules/movimentacao/movimentacao.routes.js";

const routes = Router();

routes.get("/teste", (request, response) => {
  return response.status(200).json({
    message: "Endpoint de teste funcionando",
  });
});

routes.use("/sala", salaRoutes);
routes.use("/secretarias", secretariaRoutes);
routes.use("/patrimonios", patrimonioRoutes);
routes.use("/usuarios", usuarioRoutes);
routes.use("/movimentacoes", movimentacaoRoutes);
export default routes;
