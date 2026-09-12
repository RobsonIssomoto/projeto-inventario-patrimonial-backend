# 🏛️ Sistema de Gestão e Inventário Patrimonial — API REST

API back-end do sistema mobile de controle e inventário patrimonial desenvolvido para o Projeto Integrador. A aplicação permite cadastrar e consultar bens, registrar usuários e manter o histórico de conferências, atualizações de localização e transferências.

O aplicativo mobile é mantido em um repositório separado.

## 🏗️ Objetivo

Disponibilizar uma API REST tipada e organizada em módulos para apoiar a conferência física de patrimônios. A API centraliza os dados dos bens, usuários e movimentações, utilizando MongoDB como banco de dados.

## 🛠️ Tecnologias

- Node.js.
- TypeScript.
- Express.
- MongoDB.
- Mongoose.
- `tsx` para execução em desenvolvimento.
- Git e GitHub para versionamento.

## 📌 Estrutura

```text
src/
├── modules/
│   ├── movimentacao/
│   ├── patrimonio/
│   └── usuario/
├── routes/
└── ...
```

Cada módulo segue a separação entre:

- `model`: schema e modelo do MongoDB.
- `types`: interfaces e DTOs.
- `service`: regras de acesso e persistência.
- `controller`: validação das requisições e respostas HTTP.
- `routes`: definição dos endpoints.

## Pré-requisitos

- Node.js instalado.
- MongoDB local ou MongoDB Atlas.
- Git, caso o projeto seja clonado do GitHub.

## 🚀 Instalação

Clone o repositório e instale as dependências:

```bash
git clone URL_DO_REPOSITORIO
cd projeto-inventario-patrimonial-backend
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
MONGO_URI=sua_string_de_conexao_do_mongodb
```

Não publique o arquivo `.env` no GitHub. Use o `.env.example` para documentar apenas os nomes das variáveis necessárias.

## Execução

Para executar em desenvolvimento:

```bash
npm run dev
```

A API ficará disponível na porta definida em `PORT`. Caso a aplicação esteja configurada para usar o prefixo `/api/v1`, a URL-base será:

```text
http://localhost:3000/api/v1
```

Confirme o prefixo configurado no arquivo principal da aplicação antes de realizar os testes.

## Seed de patrimônios

O projeto possui um script para inserir patrimônios de teste no MongoDB. O arquivo JSON deve conter os dados em `seed-patrimonios.json`, e o script pode ficar em:

```text
src/scripts/seed.ts
```

Exemplo de execução:

```bash
npx tsx src/scripts/seed.ts
```

O script utiliza os dados do JSON, limpa os registros existentes conforme sua implementação e insere novos patrimônios. Após a execução, utilize os `_id` retornados pelo MongoDB nas requisições de movimentação.

## 🗺️ Status do projeto

- API Express configurada.
- Conexão com MongoDB implementada.
- Módulo de usuários implementado.
- Módulo de patrimônios implementado com operações de cadastro, consulta, atualização e exclusão.
- Seed de patrimônios criado para testes.
- Módulo de movimentações implementado.
- Registro de conferências e transferências testado no Postman.

## Próximos passos

- Implementar consultas de movimentações por patrimônio e por usuário.
- Implementar listagem geral do histórico de movimentações.
- Adicionar autenticação e autorização.
- Documentar a API com OpenAPI/Swagger.
- Integrar a API ao aplicativo Flutter.
- Adicionar testes automatizados.

## Repositório mobile

O aplicativo Flutter é mantido em um repositório separado.
