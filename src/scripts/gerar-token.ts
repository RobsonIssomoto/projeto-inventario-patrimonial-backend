//Gera um idToken do Firebase para testar a API no Postman.
//Uso: npm run token -- email@exemplo.com senha

async function gerarToken() {
  const [email, senha] = process.argv.slice(2);
  const chaveApiWeb = process.env.FIREBASE_WEB_API_KEY;

  if (!email || !senha) {
    console.log("Uso: npm run token -- email@exemplo.com senha");
    return;
  }

  if (!chaveApiWeb) {
    console.log("Configure FIREBASE_WEB_API_KEY no .env (Firebase > Configurações do projeto > Geral).");
    return;
  }

  //faz o login com e-mail e senha pela API REST do Firebase Authentication
  const resposta = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${chaveApiWeb}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: senha, returnSecureToken: true }),
    },
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    console.error("Erro ao gerar token:", dados.error?.message);
    return;
  }

  console.log("Token gerado (válido por 1 hora). Use no header Authorization: Bearer <token>\n");
  console.log(dados.idToken);
}

gerarToken();
