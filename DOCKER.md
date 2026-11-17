# Executando a API com Docker Desktop + WSL2

Este guia sobe a API REST em contêiner usando o Docker Desktop com o backend WSL2 no Windows.

- **Padrão:** API no Docker + banco no **MongoDB Atlas**.
- **Opcional (sem internet):** API + MongoDB, os dois em contêineres (perfil `mongo-local`).

## 1. Preparar o Windows (uma vez só)

1. No PowerShell **como administrador**:

   ```powershell
   wsl --install
   wsl --update
   wsl --set-default-version 2
   ```

   Reinicie o computador se for pedido.

2. Instale o **Docker Desktop** e, em *Settings → General*, deixe marcado **"Use the WSL 2 based engine"**.

3. (Recomendado para notebooks com pouca RAM) Limite a memória do WSL2 criando o arquivo `C:\Users\<seu-usuario>\.wslconfig`:

   ```ini
   [wsl2]
   memory=3GB
   processors=2
   swap=2GB
   ```

   Depois rode `wsl --shutdown` e abra o Docker Desktop de novo.

4. Confira:

   ```powershell
   wsl -l -v          # deve mostrar VERSION 2
   docker version
   docker compose version
   ```

## 2. Preparar o projeto

Na pasta do back-end:

1. Coloque a conta de serviço do Firebase em `credenciais/firebase-service-account.json`.
   > Se o arquivo não existir, o Docker cria uma **pasta** com esse nome e a API não sobe.
2. Copie o arquivo de ambiente e preencha `MONGO_URI` (Atlas) e `FIREBASE_WEB_API_KEY`:

   ```powershell
   copy .env.docker.example .env.docker
   ```

3. **Atlas:** em *Network Access*, libere o IP da rede onde a API vai rodar (casa, faculdade). Para a apresentação, `0.0.0.0/0` evita surpresas — remova depois.

## 3. Subir a API

```powershell
docker compose up -d --build
docker compose ps
docker compose logs -f api   # deve mostrar "Sucesso ao conectar ao MongoDB!"
```

Teste: `http://localhost:3000/api/v1/teste`

O seed continua igual: `npm run seed` na sua máquina, com o `.env` apontando para o Atlas.

## 4. Opcional: MongoDB local em contêiner

Útil se não houver internet ou se o Atlas bloquear o IP.

1. No `.env.docker`, troque a `MONGO_URI` por:

   ```env
   MONGO_URI=mongodb://mongo:27017/inventario?replicaSet=rs0
   ```

2. Suba com o perfil:

   ```powershell
   docker compose --profile mongo-local up -d --build
   ```

3. Para o seed, no `.env` local use:

   ```env
   MONGO_URI=mongodb://localhost:27017/inventario?directConnection=true
   ```

   e rode `npm run seed`. (`directConnection=true` é necessário porque, fora da rede do Docker, o nome `mongo` não é resolvido.)

O Mongo local roda como *replica set* de um nó porque a API usa transações (`mongoose.startSession`), que o MongoDB só aceita nesse modo. O healthcheck faz o `rs.initiate` automaticamente na primeira subida. O Atlas já é replica set, por isso funciona sem configuração extra.

## 5. Acessar pelo aplicativo

| Onde o app roda | URL da API (`apiBaseUrl`) |
|---|---|
| Chrome / Windows | `http://localhost:3000/api/v1` |
| Emulador Android | `http://10.0.2.2:3000/api/v1` |
| Celular físico (mesma rede Wi-Fi) | `http://<IP do notebook>:3000/api/v1` |

Para o celular físico, libere a porta 3000 no Firewall do Windows.

## 6. Atualizar a API depois de mudar o código

```powershell
git pull
docker compose up -d --build api
```

As fotos (e, no perfil local, os dados do Mongo) ficam nos volumes `uploads-data` e `mongo-data` e não são apagados ao recriar os contêineres.

## Comandos úteis

| Ação | Comando |
|---|---|
| Parar tudo | `docker compose down` (com Mongo local: `docker compose --profile mongo-local down`) |
| Parar e **apagar os dados** | `docker compose down -v` |
| Ver uso de memória | `docker stats` |
| Abrir o shell do Mongo local | `docker exec -it inventario-mongo mongosh inventario` |
