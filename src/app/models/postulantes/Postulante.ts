export interface Postulante {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    fechaDeNacimiento: Date;
    gradoDeFormacion: string;
    habilitado?: boolean;
    eliminado?: boolean;
}
export interface PostulantesResponse {
    postulantes: Postulante[];
    totalRecords: number;
}