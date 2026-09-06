import express from "express";
import app from "./app.js";
import { ENV } from "./config/env.js";
import databaseMongo from "./config/database.js";

app.use(express.json());

const PORT = ENV.PORT || 3000;

async function startSever(): Promise<void> {
  await databaseMongo.connect();

  app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
  });
}

startSever();
