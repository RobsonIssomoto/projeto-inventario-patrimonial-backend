# Testes manuais da API

## Patrimônios

| Cenário                | Método | Endpoint                               | Resultado esperado                            | Resultado |
| ---------------------- | ------ | -------------------------------------- | --------------------------------------------- | --------- |
| Listar patrimônios     | GET    | /api/v1/patrimonios                    | Retorna lista de patrimônios                  | Aprovado  |
| Buscar por descrição   | GET    | /api/v1/patrimonios?busca=notebook     | Retorna patrimônios com notebook na descrição | Aprovado  |
| Filtrar por secretaria | GET    | /api/v1/patrimonios?secretaria=TI      | Retorna patrimônios da TI                     | Aprovado  |
| Filtrar por categoria  | GET    | /api/v1/patrimonios?categoria=Notebook | Retorna patrimônios da categoria              | Aprovado  |
| Ordenar por número     | GET    | /api/v1/patrimonios?ordenarPor=numero  | Retorna lista ordenada pelo código            | Aprovado  |
