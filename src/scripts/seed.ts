import mongoose, { type HydratedDocument } from "mongoose";
import Secretaria from "../modules/secretaria/secretaria.model.js";
import Sala from "../modules/sala/sala.model.js";
import Patrimonio from "../modules/patrimonio/patrimonio.model.js";
import Movimentacao from "../modules/movimentacao/movimentacao.model.js";
import Arquivo from "../modules/files/files.model.js";
import { Usuario } from "../modules/usuario/usuario.model.js";
import type { IUsuario } from "../modules/usuario/usuario.types.js";
import { firebaseAuth } from "../config/firebase.js";
import { ENV } from "../config/env.js";
import seedData from "../seed-inventario.json" with { type: "json" };
import seedPatrimonios from "../seed-patrimonios.json" with { type: "json" };

//senha usada por todos os usuários de teste criados pelo seed
const SENHA_TESTE = "Teste@123";

//busca o usuário no Firebase pelo e-mail; se não existir, cria com SENHA_TESTE.
//a senha é redefinida para SENHA_TESTE (para o npm run token funcionar),
//exceto quando manterSenha = true (ex.: o administrador real)
async function obterUsuarioFirebase(email: string, manterSenha = false) {
  try {
    const usuario = await firebaseAuth.getUserByEmail(email);
    if (!manterSenha) {
      await firebaseAuth.updateUser(usuario.uid, { password: SENHA_TESTE });
    }
    return usuario;
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") {
      return await firebaseAuth.createUser({ email, password: SENHA_TESTE });
    }
    throw error;
  }
}

//data de N dias atrás, para o histórico não ficar todo com a mesma data
function diasAtras(dias: number, hora = 10): Date {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(hora, 0, 0, 0);
  return data;
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
    const usuarios: (HydratedDocument<IUsuario> | null)[] = [];

    for (const dadosUsuario of seedData.usuarios) {
      const manterSenha = "manterSenha" in dadosUsuario && dadosUsuario.manterSenha === true;
      const usuarioFirebase = await obterUsuarioFirebase(dadosUsuario.email, manterSenha);

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

    //7. movimentações de exemplo, para o histórico e os recebimentos não começarem vazios
    const usuarioPorEmail = (email: string) => {
      const usuario = usuarios.find((item) => item?.email === email);
      if (!usuario) throw new Error(`Usuário do seed não encontrado: ${email}`);
      return usuario;
    };
    const patrimonioPorNumero = (numero: string) => {
      const patrimonio = patrimonios.find((item) => item.numeroPatrimonio === numero);
      if (!patrimonio) throw new Error(`Patrimônio do seed não encontrado: ${numero}`);
      return patrimonio;
    };
    const idSala = (nome: string) => mapaSalas.get(nome);
    const idSecretaria = (nome: string) => mapaSecretarias.get(nome);

    const operadorTi = usuarioPorEmail("operador.ti@teste.com");
    const operadorRh = usuarioPorEmail("operador.rh@teste.com");
    const gerenteTi = usuarioPorEmail("gerente.ti@teste.com");
    const gerenteRh = usuarioPorEmail("gerente.rh@teste.com");
    const gerenteAdm = usuarioPorEmail("gerente.administracao@teste.com");

    const pat001 = patrimonioPorNumero("PAT-001");
    const pat003 = patrimonioPorNumero("PAT-003");
    const pat005 = patrimonioPorNumero("PAT-005");
    const pat006 = patrimonioPorNumero("PAT-006");
    const pat007 = patrimonioPorNumero("PAT-007");
    const pat008 = patrimonioPorNumero("PAT-008");
    const pat010 = patrimonioPorNumero("PAT-010");
    const pat017 = patrimonioPorNumero("PAT-017");
    const pat021 = patrimonioPorNumero("PAT-021");

    await Movimentacao.insertMany([
      //conferências
      {
        usuario: operadorTi._id,
        patrimonio: pat001._id,
        tipo: "conferencia",
        status: "concluida",
        secretaria: pat001.secretaria,
        sala: pat001.sala,
        dataHora: diasAtras(6),
        dados: { status: "conferido", estadoConservacao: "bom" },
      },
      {
        usuario: operadorTi._id,
        patrimonio: pat006._id,
        tipo: "conferencia",
        status: "concluida",
        secretaria: pat006.secretaria,
        sala: pat006.sala,
        dataHora: diasAtras(4),
        dados: { status: "nao_localizado", estadoConservacao: "regular", observacoes: "Não encontrado na Sala 101" },
      },
      {
        usuario: operadorRh._id,
        patrimonio: pat003._id,
        tipo: "conferencia",
        status: "concluida",
        secretaria: pat003.secretaria,
        sala: pat003.sala,
        dataHora: diasAtras(5),
        dados: { status: "pendente", estadoConservacao: "bom", observacoes: "Etiqueta danificada" },
      },
      {
        usuario: operadorRh._id,
        patrimonio: pat021._id,
        tipo: "conferencia",
        status: "concluida",
        secretaria: pat021.secretaria,
        sala: pat021.sala,
        dataHora: diasAtras(2),
        dados: { status: "conferido", estadoConservacao: "ruim", observacoes: "Estofado rasgado" },
      },

      //troca de sala na mesma secretaria (PAT-007 estava na Sala 101 e hoje está na Sala 102)
      {
        usuario: operadorTi._id,
        patrimonio: pat007._id,
        tipo: "atualizacao_localizacao",
        status: "concluida",
        secretaria: pat007.secretaria,
        sala: pat007.sala,
        dataHora: diasAtras(3),
        dados: { salaOrigem: idSala("Sala 101"), salaDestino: idSala("Sala 102"), motivo: "Troca de sala" },
      },

      //transferência já recebida: PAT-017 veio da TI (Sala 101) para o RH (Sala 206)
      {
        usuario: gerenteTi._id,
        patrimonio: pat017._id,
        tipo: "transferencia",
        status: "recebida",
        secretaria: idSecretaria("Tecnologia da Informação"),
        sala: idSala("Sala 101"),
        dataHora: diasAtras(10),
        dados: {
          secretariaOrigem: idSecretaria("Tecnologia da Informação"),
          salaOrigem: idSala("Sala 101"),
          secretariaDestino: idSecretaria("Recursos Humanos"),
          salaDestino: idSala("Sala 206"),
          motivo: "Remanejamento de equipamento",
          justificativa: "Computador substituído na TI e reaproveitado pelo RH.",
          usuarioDestino: gerenteRh._id,
          dataRecebimento: diasAtras(9, 15),
        },
      },

      //transferência cancelada: PAT-005 (ADM -> Educação)
      {
        usuario: gerenteAdm._id,
        patrimonio: pat005._id,
        tipo: "transferencia",
        status: "cancelada",
        secretaria: pat005.secretaria,
        sala: pat005.sala,
        dataHora: diasAtras(5, 14),
        dados: {
          secretariaOrigem: pat005.secretaria,
          salaOrigem: pat005.sala,
          secretariaDestino: idSecretaria("Educação"),
          motivo: "Empréstimo para evento",
          justificativa: "Evento cancelado pela Secretaria de Educação.",
        },
      },

      //transferências pendentes (aparecem em Recebimentos)
      //PAT-008: TI -> RH  (receber com gerente.rh@teste.com)
      {
        usuario: gerenteTi._id,
        patrimonio: pat008._id,
        tipo: "transferencia",
        status: "pendente",
        secretaria: pat008.secretaria,
        sala: pat008.sala,
        dataHora: diasAtras(1),
        dados: {
          secretariaOrigem: pat008.secretaria,
          salaOrigem: pat008.sala,
          secretariaDestino: idSecretaria("Recursos Humanos"),
          motivo: "Solicitação do RH",
          justificativa: "Mouse reserva solicitado para a recepção do RH.",
        },
      },
      //PAT-010: ADM -> TI  (receber com gerente.ti@teste.com)
      {
        usuario: gerenteAdm._id,
        patrimonio: pat010._id,
        tipo: "transferencia",
        status: "pendente",
        secretaria: pat010.secretaria,
        sala: pat010.sala,
        dataHora: diasAtras(1, 16),
        dados: {
          secretariaOrigem: pat010.secretaria,
          salaOrigem: pat010.sala,
          secretariaDestino: idSecretaria("Tecnologia da Informação"),
          motivo: "Armazenamento de documentação técnica",
          justificativa: "A TI precisa de um arquivo para manuais e garantias.",
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
