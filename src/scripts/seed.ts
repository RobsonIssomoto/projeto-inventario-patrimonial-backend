import mongoose from "mongoose";
import Secretaria from "../modules/secretaria/secretaria.model.js";
import Sala from "../modules/sala/sala.model.js";
import Patrimonio from "../modules/patrimonio/patrimonio.model.js";
import Movimentacao from "../modules/movimentacao/movimentacao.model.js";
import Arquivo from "../modules/files/files.model.js";
import { Usuario } from "../modules/usuario/usuario.model.js";
import { firebaseAuth } from "../config/firebase.js";
import { ENV } from "../config/env.js";
import seedData from "../seed-inventario.json" with { type: "json" };
import seedPatrimonios from "../seed-patrimonios.json" with { type: "json" };

//senha usada por todos os usuários de teste criados pelo seed
const SENHA_TESTE = "Teste@123";

//busca o usuário no Firebase pelo e-mail; se não existir, cria.
//a senha é sempre redefinida para SENHA_TESTE, para o npm run token funcionar
async function obterUsuarioFirebase(email: string) {
  try {
    const usuario = await firebaseAuth.getUserByEmail(email);
    await firebaseAuth.updateUser(usuario.uid, { password: SENHA_TESTE });
    return usuario;
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") {
      return await firebaseAuth.createUser({ email, password: SENHA_TESTE });
    }
    throw error;
  }
}

async function seedInventario() {
  try {
    await mongoose.connect(ENV.MONGO_URI);

    console.log("Conectado ao MongoDB.");

    //1. limpa as coleções do inventário (usuários NÃO são apagados)
    await Promise.all([
      Movimentacao.deleteMany({}),
      Arquivo.deleteMany({}),
      Patrimonio.deleteMany({}),
      Sala.deleteMany({}),
      Secretaria.deleteMany({}),
    ]);

    //2. secretarias
    const secretarias = await Secretaria.insertMany(seedData.secretarias);
    const mapaSecretarias = new Map(secretarias.map((secretaria) => [secretaria.nome, secretaria._id]));

    //3. salas, vinculadas às secretarias pelo nome
    const salas = await Sala.insertMany(
      seedData.salas.map((sala) => ({
        nome: sala.nome,
        ativa: sala.ativa,
        secretaria: mapaSecretarias.get(sala.secretariaNome),
      })),
    );
    const mapaSalas = new Map(salas.map((sala) => [sala.nome, sala._id]));

    //4. patrimônios, vinculados à secretaria e à sala pelo nome
    const patrimonios = await Patrimonio.insertMany(
      seedPatrimonios.map((patrimonio) => ({
        numeroPatrimonio: patrimonio.numeroPatrimonio,
        descricao: patrimonio.descricao,
        categoria: patrimonio.categoria,
        status: patrimonio.status,
        estadoConservacao: patrimonio.estadoConservacao,
        observacoes: patrimonio.observacoes,
        ativo: patrimonio.ativo ?? true,
        secretaria: mapaSecretarias.get(patrimonio.secretariaNome),
        sala: mapaSalas.get(patrimonio.salaNome),
      })),
    );

    //5. usuários de teste: criados no Firebase e salvos (ou atualizados) no MongoDB
    const usuarios = [];

    for (const dadosUsuario of seedData.usuarios) {
      const usuarioFirebase = await obterUsuarioFirebase(dadosUsuario.email);

      const usuario = await Usuario.findOneAndUpdate(
        { uid: usuarioFirebase.uid },
        {
          uid: usuarioFirebase.uid,
          nome: dadosUsuario.nome,
          email: dadosUsuario.email,
          perfil: dadosUsuario.perfil,
          secretaria: mapaSecretarias.get(dadosUsuario.secretariaNome),
          ativo: true,
        },
        { upsert: true, new: true },
      );

      usuarios.push(usuario);
    }

    //6. usuários que já existiam (ex.: o administrador) apontavam para secretarias apagadas
    //no passo 1; eles são vinculados à secretaria de TI
    const idsSecretarias = secretarias.map((secretaria) => secretaria._id);
    const religados = await Usuario.updateMany(
      { secretaria: { $nin: idsSecretarias } },
      { secretaria: mapaSecretarias.get("Tecnologia da Informação") },
    );

    //7. algumas movimentações de exemplo (conferências), para a listagem não começar vazia
    const operadorTi = usuarios.find((usuario) => usuario?.email === "operador.ti@teste.com");
    const operadorRh = usuarios.find((usuario) => usuario?.email === "operador.rh@teste.com");
    const pat001 = patrimonios.find((patrimonio) => patrimonio.numeroPatrimonio === "PAT-001");
    const pat003 = patrimonios.find((patrimonio) => patrimonio.numeroPatrimonio === "PAT-003");

    await Movimentacao.insertMany([
      {
        usuario: operadorTi?._id,
        patrimonio: pat001?._id,
        tipo: "conferencia",
        status: "concluida",
        secretaria: pat001?.secretaria,
        sala: pat001?.sala,
        dataHora: new Date(),
        dados: {
          status: "conferido",
          estadoConservacao: "bom",
        },
      },
      {
        usuario: operadorRh?._id,
        patrimonio: pat003?._id,
        tipo: "conferencia",
        status: "concluida",
        secretaria: pat003?.secretaria,
        sala: pat003?.sala,
        dataHora: new Date(),
        dados: {
          status: "pendente",
          estadoConservacao: "bom",
          observacoes: "Etiqueta danificada",
        },
      },
    ]);

    //8. resumo com os IDs para usar no Postman
    console.log("\nSecretarias:");
    secretarias.forEach((secretaria) => console.log(`- ${secretaria.nome}: ${secretaria._id}`));

    console.log("\nSalas:");
    salas.forEach((sala) => console.log(`- ${sala.nome}${sala.ativa ? "" : " (inativa)"}: ${sala._id}`));

    console.log("\nPatrimônios:");
    patrimonios.forEach((patrimonio) =>
      console.log(
        `- ${patrimonio.numeroPatrimonio}: ${patrimonio.descricao}${patrimonio.ativo ? "" : " (inativo)"} (ID: ${patrimonio._id})`,
      ),
    );

    console.log(`\nUsuários de teste (senha: ${SENHA_TESTE}):`);
    usuarios.forEach((usuario) => console.log(`- ${usuario?.email} (${usuario?.perfil})`));

    console.log(`\nUsuários existentes religados à TI: ${religados.modifiedCount}`);
    console.log("\nSeed de inventário concluído.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Erro ao executar o seed:", error);
    process.exit(1);
  }
}

seedInventario();
