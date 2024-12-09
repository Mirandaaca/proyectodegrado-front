export interface LoginResponse {
    succeded: boolean;
    message: string;
    errors: string[] | null;
    data: AuthData;
  }
  
  export interface AuthData {
    idUsuario: string;
    email: string;
    userName: string;
    jwtToken: string;
    rol: string;
    datosUsuario: UserData;
  }
  
  export interface UserData {
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    direccion: string;
    telefono: string;
  }