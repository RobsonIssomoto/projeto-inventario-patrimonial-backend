import mongoose from "mongoose";
import Patrimonio from "../modules/patrimonio/patrimonio.model.js";
import patrimoniosData from "../seed-patrimonios.json" with { type: "json" };
import { ENV } from "../config/env.js";

async function seedPatrimonios() {
  try {
    await mongoose.connect(ENV.MONGO_URI);

    console.log("Conectado ao MongoDB.");

    await Patrimonio.deleteMany({});
    console.log("Coleção de patrimônios limpa.");

    const inseridos = await Patrimonio.insertMany(patrimoniosData);
    console.log(`${inseridos.length} patrimônios inseridos com sucesso!`);

    inseridos.forEach((p) => {
      console.log(`- ${p.numeroPatrimonio}: ${p.descricao} (ID: ${p._id})`);
    });

    await mongoose.disconnect();
    console.log("Conexão fechada.");
  } catch (error) {
    console.error("Erro ao popular patrimônios:", error);
    process.exit(1);
  }
}

seedPatrimonios();
