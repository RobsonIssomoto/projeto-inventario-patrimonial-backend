# Coleção do Postman

## Importar

Postman → **Import** → arraste `inventario-api.postman_collection.json`.

## Configurar (uma vez)

Clique na coleção → aba **Variables** e preencha:

| Variável           | Valor                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `baseUrl`          | `http://localhost:3000/api/v1` (ou o IP do notebook)                                                           |
| `firebaseApiKey`   | Chave de API da Web do Firebase (Configurações do projeto → Geral)                                             |
| `senhaAdmin`       | Senha do `admin@email.com` (o seed não altera essa senha)                                                      |
| `emailNovoUsuario` | Seu e-mail para a demonstração do cadastro. No Gmail dá para repetir com `seuemail+demo2@gmail.com`, `+demo3`… |

Os demais usuários do seed usam a senha `Teste@123` (variável `senhaTeste`).

## Roteiro

1. `npm run seed`
2. **00 - Login → Login - Administrador** (o token é salvo sozinho na variável `token`).
3. **01 - Carregar IDs** → rode as 3 requisições (salvam os IDs do seed nas variáveis).
4. Use as demais pastas. Quando a descrição disser "faça login como…", rode o login correspondente na pasta 00 antes.

clique com o botão direito numa pasta → **Run folder** para executar todas as requisições em sequência e ver os testes (✔/✖) de status.

## Demonstração

| Pasta               | Destaque                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 02 - Usuários       | Cadastro de usuário que dispara o e-mail de definição de senha do Firebase (sem tela no app)                     |
| 05 - Patrimônios    | Filtros, cadastro, **alteração de descrição e categoria** (endpoint pronto, sem tela no app), desativação lógica |
| 06 - Movimentações  | Conferência e troca de sala com histórico                                                                        |
| 07 - Transferências | Envio pendente → cancelamento / recebimento escolhendo a sala                                                    |
| 08 - Fotos          | Upload (form-data, campo `foto`), listagem e download da foto                                                    |
| 09 - Segurança      | 401 sem token ou com token inválido                                                                              |

## Sobre o e-mail de definição de senha

- O e-mail é enviado pelo próprio Firebase (modelo "Redefinição de senha"). Em **Authentication → Templates** dá para mudar o idioma para português e o nome do remetente.
- Ele costuma cair no **spam** na primeira vez.
- A API precisa de `FIREBASE_WEB_API_KEY` no `.env` / `.env.docker`; sem ela, o usuário é criado, a resposta traz `"emailEnviado": false` e o link continua disponível em `linkDefinicaoSenha`.
