import { firebaseAuth } from "../config/firebase.js";

async function testarFirebase() {
  const emailTeste = "teste.firebase@email.com";
  try {
    const usuario = await firebaseAuth.createUser({
      email: emailTeste,
      password: "senha123",
      emailVerified: false,
      disabled: false,
    });
    console.log("Usuário criado no Firebase:");
    console.log(`UID: ${usuario.uid}`);
    console.log(`E-mail: ${usuario.email}`);
  } catch (error: any) {
    if (error?.code === "auth/email-already-exists") {
      console.log("O e-mail já existe no Firebase");
      return;
    }
    console.error("Erro ao criar usuário no Firebase:", error);
  }
}

testarFirebase();
