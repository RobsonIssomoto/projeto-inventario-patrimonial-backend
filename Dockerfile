# ---------- Etapa 1: build (compila o TypeScript) ----------
FROM node:22-alpine AS build

WORKDIR /app

# Instala as dependências primeiro para aproveitar o cache do Docker
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Etapa 2: execução (imagem final, menor) ----------
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Pasta das fotos (montada como volume no docker-compose)
RUN mkdir -p /app/uploads /app/credenciais && chown -R node:node /app

# Não roda como root
USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
