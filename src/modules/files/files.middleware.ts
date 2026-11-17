import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { ENV } from "../../config/env.js";

//cria a pasta de uploads caso ainda não exista
mkdirSync(ENV.UPLOADS_DIR, { recursive: true });

const extensoesPermitidas: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: ENV.UPLOADS_DIR,
    filename: (request, file, callback) => {
      callback(null, `${randomUUID()}${extensoesPermitidas[file.mimetype]}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, //5 MB
  },
  fileFilter: (request, file, callback) => {
    if (!extensoesPermitidas[file.mimetype]) {
      return callback(new Error("Formato inválido. Envie uma imagem JPEG, PNG ou WEBP."));
    }

    return callback(null, true);
  },
});

export function uploadFoto(request: Request, response: Response, next: NextFunction): void {
  upload.single("foto")(request, response, (error: unknown) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      response.status(400).json({
        erro: "A foto deve ter no máximo 5 MB.",
      });
      return;
    }

    if (error instanceof Error) {
      response.status(400).json({
        erro: error.message,
      });
      return;
    }

    next();
  });
}
