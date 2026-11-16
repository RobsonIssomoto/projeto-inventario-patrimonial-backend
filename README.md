# 🏛️ Sistema de Gestão e Inventário Patrimonial — API REST

API back-end do sistema mobile de controle e inventário patrimonial desenvolvido para o Projeto Integrador. A aplicação permite cadastrar e consultar secretarias, salas, usuários e patrimônios, além de registrar conferências, mudanças de sala, transferências entre secretarias (com fluxo de recebimento) e fotos dos patrimônios.

O aplicativo mobile é mantido em um repositório separado (ver [Repositório mobile](#repositório-mobile)).

## 🏗️ Objetivo

Disponibilizar uma API REST tipada e organizada em módulos para apoiar a conferência física e o controle de localização de patrimônios. A API centraliza os dados de secretarias, salas, usuários, bens patrimoniais e movimentações, utilizando MongoDB como banco de dados e Firebase Authentication para autenticação.

## 🛠️ Tecnologias

- Node.js
- TypeScript
- Express
- MongoDB e Mongoose
- Firebase Admin SDK (Firebase Authentication)
- Multer para upload de arquivos
- `tsx` para execução em desenvolvimento
- Git e GitHub para versionamento

## 📌 Estrutura

```text
src/
├── config/                 # Variáveis de ambiente, conexão com MongoDB e Firebase
├── docs/                   # Documentação de endpoints e testes
├── modules/
│   ├── files/
│   ├── movimentacao/
│   ├── patrimonio/
│   ├── sala/
│   ├── secretaria/
│   └── usuario/
├── routes/                 # Agregador de rotas (/api/v1)
├── scripts/                # Seed, geração de token e testes do Firebase
├── seed-inventario.json    # Secretarias, salas e usuários de teste
├── seed-patrimonios.json   # Patrimônios de teste
├── app.ts
└── server.ts
```

Cada módulo segue a separação entre:

- `types`: interfaces, tipos e DTOs.
- `model`: schema e modelo do MongoDB.
- `service`: regras de negócio e persistência.
- `controller`: validação das requisições e respostas HTTP.
- `middleware`: validações específicas do módulo.
- `routes`: definição dos endpoints.

## Pré-requisitos

- Node.js instalado.
- MongoDB Atlas (necessário suporte a transações) ou MongoDB local em modo réplica.
- Projeto no Firebase com Authentication (e-mail/senha) habilitado.
- Arquivo JSON da conta de serviço do Firebase.
- Git, caso o projeto seja clonado do GitHub.

## 🚀 Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/RobsonIssomoto/projeto-inventario-patrimonial-backend.git
cd projeto-inventario-patrimonial-backend
npm install
```

## ⚙️ Configuração

Copie o `.env.example` para `.env` e preencha os valores:

```env
PORT=3000
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/nome_do_banco
FIREBASE_SERVICE_ACCOUNT_PATH=credenciais/firebase-service-account.json
FIREBASE_WEB_API_KEY=
UPLOADS_DIR=uploads
```

| Variável                        | Descrição                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `PORT`                          | Porta da API (padrão `3000`).                                                                   |
| `MONGO_URI`                     | String de conexão do MongoDB.                                                                   |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Caminho do JSON da conta de serviço do Firebase (Configurações do projeto > Contas de serviço). |
| `FIREBASE_WEB_API_KEY`          | Chave de API da Web do Firebase, usada apenas pelo `npm run token`.                             |
| `UPLOADS_DIR`                   | Pasta onde as fotos são salvas (opcional, padrão `uploads`).                                    |

Não publique o `.env` nem o JSON da conta de serviço no GitHub. Use o `.env.example` para documentar apenas os nomes das variáveis.

## Execução

Para executar em desenvolvimento:

```bash
npm run dev
```

Para gerar o build e executar a versão compilada:

```bash
npm run build
npm start
```

A API ficará disponível na porta definida em `PORT`. A URL-base atual é:

```text
http://localhost:3000/api/v1
```

## 🔐 Autenticação e perfis

Todas as rotas exigem o header `Authorization: Bearer <idToken>`, com um token emitido pelo Firebase Authentication. A API valida o token e carrega o usuário correspondente no MongoDB.

| Perfil          | Permissões principais                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| `administrador` | Acesso a todas as secretarias; cadastra secretarias, salas e usuários.                        |
| `gerente`       | Atua na própria secretaria; cadastra salas e usuários; cria, cancela e recebe transferências. |
| `operador`      | Atua na própria secretaria; consulta patrimônios, registra conferências e mudanças de sala.   |

### Gerando um token para testes

Com `FIREBASE_WEB_API_KEY` configurada, gere um `idToken` (válido por 1 hora) para usar no Postman:

```bash
npm run token -- email@exemplo.com senha
```

## 🌱 Seed de dados

O projeto possui um script para popular o banco com dados de teste:

```bash
npm run seed
```

O script:

1. Limpa as coleções de movimentações, arquivos, patrimônios, salas e secretarias.
2. Cria as secretarias e salas de `src/seed-inventario.json` (incluindo uma sala inativa).
3. Cria ou atualiza no Firebase e no MongoDB os usuários de teste (gerentes e operadores de TI, RH e Administração), todos com a mesma senha de teste.
4. Cadastra os patrimônios de `src/seed-patrimonios.json` (incluindo um patrimônio desativado).
5. Registra algumas conferências de exemplo.
6. Exibe no terminal os usuários de teste, a senha e os IDs gerados, para uso no Postman.
   O usuário administrador inicial pode ser cadastrado manualmente a partir do modelo em `src/docs/usuario-admin-inicial.json`.

## 🧩 Módulos

### Secretaria

Gerencia as secretarias/setores responsáveis pelos patrimônios. Cada secretaria pode possuir várias salas. Cadastro e edição restritos ao administrador.

### Sala

Gerencia as salas/localizações físicas vinculadas às secretarias. Cada sala pertence a uma secretaria. Cadastro, edição e desativação restritos a gerentes e administradores.

### Usuário

Gerencia os usuários do sistema, criados simultaneamente no Firebase Authentication e no MongoDB.

- `GET /usuarios/eu` retorna o perfil do usuário autenticado.
- Cadastro e consulta por UID restritos a gerentes e administradores.

### Patrimônio

Gerencia os bens patrimoniais. Cada patrimônio é vinculado a uma secretaria e a uma sala por referência `ObjectId`.

Regras principais:

- O número do patrimônio é obrigatório e único.
- A secretaria e a sala são obrigatórias, devem existir, estar ativas e a sala deve pertencer à secretaria.
- As operações são restritas à secretaria do usuário (administrador acessa todos).
- A atualização permite alterar descrição, categoria, status, estado de conservação, observações e a sala.
- A troca de sala só é permitida dentro da mesma secretaria, para uma sala ativa e diferente da atual, e gera automaticamente um registro de `atualizacao_localizacao` no histórico.
- Não é possível trocar a sala enquanto houver transferência pendente.
- O número patrimonial e a secretaria não podem ser alterados pelo endpoint de atualização.
- A exclusão é lógica: o patrimônio é desativado, preservando seu histórico e referências.

### Movimentação

Registra o histórico de conferências, mudanças de sala e transferências de patrimônios.

- `conferencia`: registra a conferência física de um patrimônio.
- `atualizacao_localizacao`: registra mudança de sala dentro da mesma secretaria.
- `transferencia`: solicita a transferência do patrimônio para outra secretaria.
  Status possíveis: `concluida`, `pendente`, `recebida` e `cancelada`.

Regras principais:

- O usuário é obtido do token e a data/hora é definida pelo servidor.
- O cliente envia apenas `patrimonioId`, `tipo` e `dados`. A origem (secretaria e sala) é lida do próprio patrimônio.
- O patrimônio deve existir, estar ativo e pertencer à secretaria do usuário (administrador movimenta qualquer patrimônio).
- A movimentação e a atualização do patrimônio são gravadas na mesma transação.
- A listagem mostra apenas movimentações da secretaria do usuário, incluindo transferências recebidas. O administrador vê todas.
  Fluxo de transferência:

1. Um gerente ou administrador cria a transferência informando a secretaria de destino. Ela fica com status `pendente` e o patrimônio permanece na origem.
2. Enquanto houver transferência pendente, o patrimônio não pode ter outra transferência nem mudança de sala.
3. O gerente da secretaria de origem (ou um administrador) pode cancelar a transferência pendente.
4. O gerente da secretaria de destino consulta as transferências em `GET /movimentacoes/recebimentos` e confirma o recebimento escolhendo uma sala ativa da sua secretaria.
5. Ao receber, o patrimônio é movido para a nova secretaria e sala na mesma transação, e a transferência passa a `recebida`. Se a localização do patrimônio mudou desde a solicitação, o recebimento é recusado.

### Arquivos

Upload e download de fotos dos patrimônios com `multer`. As fotos ficam na pasta definida em `UPLOADS_DIR` (padrão `uploads/`) e o MongoDB guarda apenas os metadados.

- O envio usa form-data, campo `foto`, nos formatos JPEG, PNG ou WEBP, com até 5 MB.
- O acesso é permitido somente para usuários da secretaria atual do patrimônio (administrador acessa todos).
- Ao usar Docker, monte um volume na pasta de uploads para não perder as fotos.

## 📄 Endpoints

Todos os caminhos são relativos a `/api/v1`.

| Método    | Rota                                 | Descrição                                                   |
| --------- | ------------------------------------ | ----------------------------------------------------------- |
| GET       | `/secretarias`                       | Lista secretarias                                           |
| GET       | `/secretarias/:id`                   | Consulta secretaria                                         |
| POST      | `/secretarias`                       | Cadastra secretaria (administrador)                         |
| PUT       | `/secretarias/:id`                   | Atualiza secretaria (administrador)                         |
| GET       | `/salas`                             | Lista salas                                                 |
| GET       | `/salas/:id`                         | Consulta sala                                               |
| POST      | `/salas`                             | Cadastra sala (gerente/administrador)                       |
| PUT       | `/salas/:id`                         | Atualiza sala (gerente/administrador)                       |
| PATCH     | `/salas/:id/desativar`               | Desativa sala (gerente/administrador)                       |
| GET       | `/usuarios/eu`                       | Perfil do usuário autenticado                               |
| GET       | `/usuarios/:uid`                     | Consulta usuário (gerente/administrador)                    |
| POST      | `/usuarios`                          | Cadastra usuário (gerente/administrador)                    |
| GET       | `/patrimonios`                       | Lista patrimônios                                           |
| GET       | `/patrimonios/numero/:numero`        | Consulta por número patrimonial                             |
| POST      | `/patrimonios`                       | Cadastra patrimônio                                         |
| PUT/PATCH | `/patrimonios/:id`                   | Atualiza patrimônio                                         |
| DELETE    | `/patrimonios/:id`                   | Desativa patrimônio                                         |
| GET       | `/movimentacoes`                     | Lista movimentações                                         |
| POST      | `/movimentacoes`                     | Registra conferência, mudança de sala ou transferência      |
| PATCH     | `/movimentacoes/:id/cancelar`        | Cancela transferência pendente                              |
| GET       | `/movimentacoes/recebimentos`        | Lista transferências pendentes para a secretaria do usuário |
| PATCH     | `/movimentacoes/:id/receber`         | Confirma recebimento de transferência                       |
| POST      | `/arquivos/patrimonio/:patrimonioId` | Envia foto do patrimônio                                    |
| GET       | `/arquivos/patrimonio/:patrimonioId` | Lista fotos do patrimônio                                   |
| GET       | `/arquivos/:id`                      | Baixa a foto                                                |

Os detalhes de cada endpoint, cenários de teste manuais e resultados validados no Postman estão em:

```text
src/docs/teste-api.md
```

## 🗺️ Status do projeto

- API Express configurada, com conexão ao MongoDB.
- Módulos de secretarias, salas, usuários, patrimônios, movimentações e arquivos implementados.
- Relacionamentos padronizados com `ObjectId`.
- Autenticação com Firebase Authentication e permissões por perfil (administrador, gerente e operador).
- Visualização e operações restritas à secretaria do usuário.
- Troca de sala com registro automático no histórico.
- Transferência entre secretarias com fluxo de pendência, cancelamento e recebimento.
- Bloqueio de mudanças de localização enquanto houver transferência pendente.
- Atualização do patrimônio na mesma transação da movimentação.
- Seed com usuários de teste no Firebase e script para geração de token.
- API integrada ao aplicativo Flutter.

## Próximos passos

- Implementar consultas de movimentações por patrimônio e por usuário.
- Upload e download de fotos dos patrimônios.
- Padronizar as chaves das respostas de erro (`erro`/`mensagem`) em todos os módulos.
- Documentar a API com OpenAPI/Swagger.
- Implementar leitura de código de barras pela câmera no aplicativo.
- Adicionar testes automatizados.

## Repositório mobile

O aplicativo Flutter é mantido em:
https://github.com/RobsonIssomoto/projeto-inventario-patrimonial-frontend
