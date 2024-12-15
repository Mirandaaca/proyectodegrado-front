export interface Usuario {
    id?: string;
    nombre: string;
    apellido: string;
    direccion: string;
    role: string;
    email: string;
    fechaDeNacimiento: Date;
    telefono?: string;
    password?: string;
  }
  
  export interface UsuariosResponse {
    succeded: boolean;
    message: string | null;
    errors: any | null;
    data: Usuario[];
  }
  
  export interface UsuarioResponse {
    succeded: boolean;
    message: string | null;
    errors: any | null;
    data: Usuario;
  }