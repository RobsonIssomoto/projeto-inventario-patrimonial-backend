import express from "express";
import type { Express } from "express";
import cors from "cors";
import routes from "./routes/routes.js";
import { ENV } from "./config/env.js";

class App {
  public server: Express;

  constructor() {
    this.server = express();
    this.middleware();
    this.routes();
  }

  private middleware(): void {
    this.server.use(
      cors({
        origin: ENV.CORS_ORIGIN.split(",").map((origem) => origem.trim()),
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.server.use("/api/v1", routes);
  }
}

export default new App().server;
