// Testes de integração simples da API (Node test runner, sem dependências extras).
// Pré-requisito: API rodando (ex.: docker compose up -d).
// Execução:  npm test
// Opcional:  defina TEST_TOKEN com um token válido (npm run token) para rodar os testes autenticados.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";
const TEST_TOKEN = process.env.TEST_TOKEN;

async function requisitar(caminho, { metodo = "GET", token, corpo } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const texto = await resposta.text();
  let dados = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    dados = texto;
  }

  return { status: resposta.status, dados };
}

describe("Disponibilidade", () => {
  test("GET /teste responde 200", async () => {
    const { status, dados } = await requisitar("/teste");
    assert.equal(status, 200);
    assert.equal(dados.message, "Endpoint de teste funcionando");
  });
});

describe("Autenticação", () => {
  test("GET /patrimonios sem token retorna 401", async () => {
    const { status } = await requisitar("/patrimonios");
    assert.equal(status, 401);
  });

  test("GET /patrimonios com token inválido retorna 401", async () => {
    const { status } = await requisitar("/patrimonios", { token: "token-invalido" });
    assert.equal(status, 401);
  });

  test("POST /movimentacoes sem token retorna 401", async () => {
    const { status } = await requisitar("/movimentacoes", { metodo: "POST", corpo: {} });
    assert.equal(status, 401);
  });
});

describe("Rotas autenticadas", { skip: !TEST_TOKEN && "defina TEST_TOKEN para executar" }, () => {
  test("GET /usuarios/eu retorna o perfil do usuário", async () => {
    const { status, dados } = await requisitar("/usuarios/eu", { token: TEST_TOKEN });
    assert.equal(status, 200);
    assert.ok(["operador", "gerente", "administrador"].includes(dados.perfil));
  });

  test("GET /patrimonios retorna uma lista", async () => {
    const { status, dados } = await requisitar("/patrimonios", { token: TEST_TOKEN });
    assert.equal(status, 200);
    assert.ok(Array.isArray(dados) || Array.isArray(dados?.dados));
  });

  test("POST /movimentacoes com tipo inválido retorna 400", async () => {
    const { status } = await requisitar("/movimentacoes", {
      metodo: "POST",
      token: TEST_TOKEN,
      corpo: { patrimonioId: "000000000000000000000000", tipo: "invalido", dados: {} },
    });
    assert.equal(status, 400);
  });
});
