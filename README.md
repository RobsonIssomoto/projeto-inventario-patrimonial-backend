# 🏛️ Sistema de Gestão e Inventário Patrimonial - API REST (Back-end)

Projeto desenvolvido para a disciplina de Projeto Integrador (PI). Este repositório contém exclusivamente a **API REST (Back-end)** do sistema de inventário patrimonial, projetada para alimentar o aplicativo móvel utilizado na conferência física e leitura de patrimônios da Prefeitura de Atibaia. O aplicativo móvel (Front-end) está hospedado em um repositório separado.

## 🏗️ Objetivo do Repositório

Fornecer uma API robusta, escalável e tipada, construída com Node.js e TypeScript, utilizando persistência de dados em **MongoDB** via Mongoose. O sistema centraliza o controle de bens públicos, permitindo cadastro, conferência de status em tempo real, filtros por localização/setor e histórico de movimentações.

## 🚀 Como Executar a API

1. Certifique-se de ter o **Node.js** instalado em sua máquina.
2. Clone o repositório e instale as dependências executando o comando `npm install` no terminal.
3. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` e configure as variáveis de ambiente
   ```env
   PORT=3000
   MONGO_URI=sua_string_de_conexao_do_mongodb
   ```
4. Inicie o servidor em modo de desenvolvimento rodando `npm run dev`. O servidor estará disponível em `http://localhost:3000/api/v1`

## 🛠️ Tecnologias Utilizadas

- **Linguagem e Runtime:** Node.js com TypeScript.
- **Framework Web:** Express.
- **Banco de Dados:** MongoDB gerenciado via ODM Mongoose.
- **Desenvolvimento e Build:** `tsx` (hot-reload nativo para TypeScript).
- **Arquitetura:** Padrão Modular e Clean Architecture (Controllers, Services, Models, Routes e DTOs tipados).

## 📌 Rotas Disponíveis (v1)

### Base URL: `/api/v1`

| Método          | Endpoint                      | Descrição                                                 |
| :-------------- | :---------------------------- | :-------------------------------------------------------- |
| **GET**         | `/teste`                      | Rota de verificação do status da API                      |
| **POST**        | `/patrimonios`                | Cadastro de um novo bem patrimonial                       |
| **GET**         | `/patrimonios`                | Listagem com suporte a busca textual, filtros e ordenação |
| **GET**         | `/patrimonios/numero/:numero` | Busca rápida por tombamento (leitor de código de barras)  |
| **PUT / PATCH** | `/patrimonios/:id`            | Atualização de dados ou conferência de status             |
| **DELETE**      | `/patrimonios/:id`            | Exclusão de registro patrimonial                          |

## 🗺️ Status do Projeto

- Conexão e tratamento de persistência com MongoDB estabelecidos com sucesso.
- Módulo de Patrimônio implementado: CRUD completo com separação estrita de camadas e contratos tipados (DTOs).
- Mecanismo de busca textual e filtros estruturados por setor, sala, tipo de objeto e status de conferência.
- Tratamento nativo de validações de entrada e prevenção de duplicidade de tombamento.
- **Próximos Passos:** Implementação dos módulos de Movimentação de Bens, Usuários/Autenticação (JWT) e upload de fotos/comprovantes.
