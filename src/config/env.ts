import "dotenv/config";

//Função que valida e retorna variável estritamente uma string
function obterVariavelAmbiente(nomeDaVariavel: string): string {
  const valor = process.env[nomeDaVariavel];
  if (!valor) {
    throw new Error(`ERRO CRÍTICO: A variável de ambiente ${nomeDaVariavel} não foi configurada no .env`);
  }
  return valor;
}

//Exporta um objeto limpo com todas as variáveis que o sistema vai usar
export const ENV = {
  //O TypeScript tem 100% de certeza que as variáveis são strings
  MONGO_URI: obterVariavelAmbiente("MONGO_URI"),
  PORT: obterVariavelAmbiente("PORT") || "3000",
};
