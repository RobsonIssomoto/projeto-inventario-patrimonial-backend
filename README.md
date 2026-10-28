# 🏛️ Sistema de Gestão e Inventário Patrimonial — API REST

API back-end do sistema mobile de controle e inventário patrimonial desenvolvido para o Projeto Integrador. A aplicação permite cadastrar e consultar secretarias, salas, usuários e patrimônios, além de registrar conferências, atualizações de localização e transferências.

O aplicativo mobile é mantido em um repositório separado.

## 🏗️ Objetivo

Disponibilizar uma API REST tipada e organizada em módulos para apoiar a conferência física e o controle de localização de patrimônios. A API centraliza os dados de secretarias, salas, usuários, bens patrimoniais e movimentações, utilizando MongoDB como banco de dados.

## 🛠️ Tecnologias

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- `tsx` para execução em desenvolvimento
- Git e GitHub para versionamento

## 📌 Estrutura

```text
src/
├── modules/
│   ├── files/
│   ├── movimentacao/
│   ├── patrimonio/
│   ├── sala/
│   ├── secretaria/
│   └── usuario/
├── routes/
├── scripts/
└── seed-inventario.json
```

Cada módulo segue a separação entre:

- `types`: interfaces, tipos e DTOs.
- `model`: schema e modelo do MongoDB.
- `service`: regras de negócio e persistência.
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

A API ficará disponível na porta definida em `PORT`. A URL-base atual é:

```text
http://localhost:3000/api/v1
```

## Seed de dados

O projeto possui um script para popular o banco com dados de teste. Ele cria secretarias, salas e patrimônios com relacionamentos consistentes por `ObjectId`.

```bash
npm run seed
```

O script está disponível em:

```text
src/scripts/seed.ts
```

Os dados base de secretarias e salas estão em:

```text
src/seed-inventario.json
```

O script limpa as coleções relacionadas, cria secretarias, cria salas vinculadas às secretarias e cadastra patrimônios associados a uma secretaria e a uma sala.

## 🧩 Módulos

### Secretaria

Gerencia as secretarias/setores responsáveis pelos patrimônios. Cada secretaria pode possuir várias salas.

### Sala

Gerencia as salas/localizações físicas vinculadas às secretarias. Cada sala pertence a uma secretaria.

### Patrimônio

Gerencia os bens patrimoniais. Cada patrimônio é vinculado a uma secretaria e a uma sala por referência `ObjectId`.

Regras principais:

- O número do patrimônio é obrigatório e único.
- A secretaria e a sala são obrigatórias e devem existir no banco.
- A secretaria e a sala devem estar ativas.
- A sala informada deve pertencer à secretaria informada.
- A atualização permite alterar apenas descrição, categoria, status, estado de conservação e observações.
- O número patrimonial, a secretaria e a sala não podem ser alterados diretamente pelo endpoint de atualização.
- A exclusão é lógica: o patrimônio é desativado, preservando seu histórico e referências.

### Movimentação

Registra o histórico de conferências, atualizações de localização e transferências de patrimônios.

- `conferencia`: registra a conferência física de um patrimônio.
- `atualizacao_localizacao`: registra mudança de sala dentro da mesma secretaria.
- `transferencia`: registra transferência do patrimônio para outra secretaria.

## 📄 Endpoints e testes

Os endpoints detalhados, cenários de teste manuais e resultados validados no Postman estão documentados em:

```text
src/config/teste-api.md
```

## 🗺️ Status do projeto

- API Express configurada.
- Conexão com MongoDB implementada.
- Módulo de usuários implementado.
- Módulos de secretaria e sala implementados.
- Módulo de patrimônios implementado com cadastro, consulta, atualização e desativação.
- Relacionamentos de patrimônio com secretaria e sala padronizados com `ObjectId`.
- Seed de inventário criado para testes.
- Módulo de movimentações implementado.
- Registro de conferências e transferências testado no Postman.

## Próximos passos

- Implementar autenticação com Firebase Authentication.
- Controlar permissões por perfil: administrador, gerente e operador.
- Restringir a visualização e operações conforme a secretaria do usuário.
- Diferenciar atualização de localização e transferência entre secretarias.
- Implementar confirmação de recebimento de transferências.
- Atualizar automaticamente a localização atual do patrimônio após a confirmação.
- Implementar consultas de movimentações por patrimônio e por usuário.
- Documentar a API com OpenAPI/Swagger.
- Integrar a API ao aplicativo Flutter.
- Implementar leitura de código de barras pela câmera.
- Adicionar testes automatizados.

## Repositório mobile

O aplicativo Flutter é mantido em um repositório separado.
