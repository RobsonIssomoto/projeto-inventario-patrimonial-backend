import mongoose from "mongoose";
import { ENV } from "./env.js";

class DataBase {
  public async connect(): Promise<void> {
    try {
      await mongoose.connect(ENV.MONGO_URI);
    } catch (error) {
      console.error("Erro ao conectar ao MongoDB", error);
      process.exit(1);
    }
  }
}

export default new DataBase();
