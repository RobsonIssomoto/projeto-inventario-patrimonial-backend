import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "node:fs";
import { getFirestore } from "firebase-admin/firestore";
import { ENV } from "./env.js";

//Verifica se já existe uma instância do Firebase inicializada
function inicializarFirebase() {
  const appJaInicializado = getApps().length > 0;
  if (appJaInicializado) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert(ENV.FIREBASE_SERVICE_ACCOUNT_PATH),
  });
}

export const firebaseApp = inicializarFirebase();
export const firebaseAuth = getAuth(firebaseApp);
