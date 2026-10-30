# Endpoints e testes manuais da API

URL-base:

```text
http://localhost:3000/api/v1
```

## Secretarias

| Método   | Endpoint           | Descrição                    |
| -------- | ------------------ | ---------------------------- |
| `POST`   | `/secretarias`     | Cadastra uma secretaria      |
| `GET`    | `/secretarias`     | Lista secretarias            |
| `GET`    | `/secretarias/:id` | Busca uma secretaria pelo ID |
| `PUT`    | `/secretarias/:id` | Atualiza uma secretaria      |
| `PATCH`  | `/secretarias/:id` | Atualiza uma secretaria      |
| `DELETE` | `/secretarias/:id` | Desativa uma secretaria      |

## Salas

| Método   | Endpoint     | Descrição              |
| -------- | ------------ | ---------------------- |
| `POST`   | `/salas`     | Cadastra uma sala      |
| `GET`    | `/salas`     | Lista salas            |
| `GET`    | `/salas/:id` | Busca uma sala pelo ID |
| `PUT`    | `/salas/:id` | Atualiza uma sala      |
| `PATCH`  | `/salas/:id` | Atualiza uma sala      |
| `DELETE` | `/salas/:id` | Desativa uma sala      |

## Patrimônios

| Método   | Endpoint                      | Descrição                       |
| -------- | ----------------------------- | ------------------------------- |
| `POST`   | `/patrimonios`                | Cadastra um patrimônio          |
| `GET`    | `/patrimonios`                | Lista patrimônios com filtros   |
| `GET`    | `/patrimonios/numero/:numero` | Busca um patrimônio pelo número |
| `PUT`    | `/patrimonios/:id`            | Atualiza campos permitidos      |
| `PATCH`  | `/patrimonios/:id`            | Atualiza campos permitidos      |
| `DELETE` | `/patrimonios/:id`            | Desativa um patrimônio          |

## Regras do patrimônio

- `numeroPatrimonio` é obrigatório e único.
- `secretaria` e `sala` são obrigatórias e devem existir.
- A secretaria e a sala devem estar ativas.
- A sala deve pertencer à secretaria informada.
- O `update` permite alterar apenas `descricao`, `categoria`, `status`, `estadoConservacao` e `observacoes`.
- `numeroPatrimonio`, `secretaria` e `sala` não podem ser alterados pelo `update`.
- O `DELETE` realiza desativação lógica, definindo `ativo: false`.

## Testes manuais — Patrimônios

| Cenário                         | Método   | Endpoint                                   | Resultado esperado                                            | Resultado |
| ------------------------------- | -------- | ------------------------------------------ | ------------------------------------------------------------- | --------- |
| Listar patrimônios              | `GET`    | `/patrimonios`                             | Retorna lista de patrimônios                                  | Aprovado  |
| Buscar por descrição            | `GET`    | `/patrimonios?busca=notebook`              | Retorna patrimônios com “notebook” na descrição               | Aprovado  |
| Filtrar por secretaria          | `GET`    | `/patrimonios?secretaria=ID_DA_SECRETARIA` | Retorna patrimônios da secretaria informada                   | Aprovado  |
| Filtrar por sala                | `GET`    | `/patrimonios?sala=ID_DA_SALA`             | Retorna patrimônios da sala informada                         | Aprovado  |
| Filtrar por categoria           | `GET`    | `/patrimonios?categoria=Notebook`          | Retorna patrimônios da categoria informada                    | Aprovado  |
| Ordenar por número              | `GET`    | `/patrimonios?ordenarPor=numero`           | Retorna lista ordenada pelo número patrimonial                | Aprovado  |
| Buscar por número               | `GET`    | `/patrimonios/numero/PAT-0001`             | Retorna o patrimônio correspondente                           | Aprovado  |
| Buscar patrimônio inexistente   | `GET`    | `/patrimonios/numero/PAT-NAO-EXISTE`       | Retorna `404`                                                 | Aprovado  |
| Cadastrar patrimônio válido     | `POST`   | `/patrimonios`                             | Retorna `201` e o patrimônio criado                           | Aprovado  |
| Sala de outra secretaria        | `POST`   | `/patrimonios`                             | Retorna `400` informando que a sala não pertence à secretaria | Aprovado  |
| ID inválido                     | `POST`   | `/patrimonios`                             | Retorna `400` informando ID inválido                          | Aprovado  |
| Número patrimonial duplicado    | `POST`   | `/patrimonios`                             | Retorna `409` informando duplicidade                          | Aprovado  |
| Atualizar descrição             | `PATCH`  | `/patrimonios/:id`                         | Retorna `200` e atualiza apenas campos permitidos             | Aprovado  |
| Tentar alterar sala pelo update | `PATCH`  | `/patrimonios/:id`                         | Ignora o campo `sala` e mantém a localização atual            | Aprovado  |
| Desativar patrimônio            | `DELETE` | `/patrimonios/:id`                         | Retorna `200` e define `ativo: false`                         | Aprovado  |
