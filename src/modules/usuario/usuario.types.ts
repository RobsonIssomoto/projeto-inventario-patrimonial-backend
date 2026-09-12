export interface IUsuario {
  uid: string;
  nome: string;
  email: string;
  setor: string;
  perfil: "operador" | "administrador";
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateUsuarioDTO {
  uid: string;
  nome: string;
  email: string;
  setor: string;
  perfil: "operador" | "administrador";
  ativo?: boolean;
}
