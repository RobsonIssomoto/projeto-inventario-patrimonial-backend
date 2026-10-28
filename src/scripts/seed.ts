import mongoose from "mongoose";
import Secretaria from "../modules/secretaria/secretaria.model.js";
import Sala from "../modules/sala/sala.model.js";
import Patrimonio from "../modules/patrimonio/patrimonio.model.js";
import { ENV } from "../config/env.js";
import seedData from "../seed-inventario.json" with { type: "json" };

async function seedInventario() {
  try {
    await mongoose.connect(ENV.MONGO_URI);

    console.log("Conectado ao MongoDB.");

    await Promise.all([Patrimonio.deleteMany({}), Sala.deleteMany({}), Secretaria.deleteMany({})]);

    const secretarias = await Secretaria.insertMany(seedData.secretarias);

    const mapaSecretarias = new Map(secretarias.map((secretaria) => [secretaria.nome, secretaria._id]));

    const salasParaInserir = seedData.salas.map((sala) => ({
      nome: sala.nome,
      ativa: sala.ativa,
      secretaria: mapaSecretarias.get(sala.secretariaNome),
    }));

    const salas = await Sala.insertMany(salasParaInserir);

    const sala101 = salas.find((sala) => sala.nome === "Sala 101");
    const sala205 = salas.find((sala) => sala.nome === "Sala 205");
    const sala302 = salas.find((sala) => sala.nome === "Sala 302");

    const ti = mapaSecretarias.get("Tecnologia da Informação");
    const rh = mapaSecretarias.get("Recursos Humanos");
    const administrativo = mapaSecretarias.get("Administrativo");

    const patrimoniosInseridos = await Patrimonio.insertMany([
      {
        numeroPatrimonio: "PAT-001",
        descricao: "Notebook Dell Latitude 5420",
        secretaria: ti,
        sala: sala101?._id,
        categoria: "Notebook",
        status: "conferido",
        estadoConservacao: "bom",
      },
      {
        numeroPatrimonio: "PAT-002",
        descricao: "Monitor LG 24 polegadas",
        secretaria: ti,
        sala: sala101?._id,
        categoria: "Monitor",
        status: "conferido",
        estadoConservacao: "novo",
      },
      {
        numeroPatrimonio: "PAT-003",
        descricao: "Cadeira de escritório ergonômica",
        secretaria: rh,
        sala: sala205?._id,
        categoria: "Móvel",
        status: "pendente",
        estadoConservacao: "bom",
      },
      {
        numeroPatrimonio: "PAT-004",
        descricao: "Impressora HP LaserJet Pro",
        secretaria: administrativo,
        sala: sala302?._id,
        categoria: "Impressora",
        status: "pendente",
        estadoConservacao: "bom",
      },
    ]);

    console.log(`${patrimoniosInseridos.length} patrimônios inseridos com sucesso!`);

    patrimoniosInseridos.forEach((patrimonio) => {
      console.log(`- ${patrimonio.numeroPatrimonio}: ${patrimonio.descricao} (ID: ${patrimonio._id})`);
    });

    console.log("Seed de inventário concluído.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Erro ao executar o seed:", error);
    process.exit(1);
  }
}

seedInventario();
