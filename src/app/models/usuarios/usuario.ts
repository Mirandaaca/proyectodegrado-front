export interface Usuario {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    direccion: string;
    fechaDeNacimiento: Date;
    role?: string;
  }