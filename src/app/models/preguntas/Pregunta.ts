export interface Pregunta {
    id: number;
    idTestPsicotecnico: number;
    idFactor?: number;
    enunciado: string;
    orden: number;
    respuestas: Respuesta[];
    rutaImagen: string;
}

export interface Respuesta {
    id: number;
    descripcion: string;
    rutaImagen?: string;
    opcion: string;
    puntaje: number;
    esCorrecta?: boolean;
    orden: number;
}

export interface CrearPreguntaRequest {
    idTestPsicotecnico: number;
    idFactor?: number;
    enunciado: string;
    imagen?: string;
}

export interface ActualizarRespuestaRequest {
    Id: string;
    Descripcion: string;
    Opcion: string;
    Puntaje: string;
    EsCorrecta: string;
    IndiceRaven: string;
    nuevaImagen: string;
}
export interface CrearRespuestaRequest {
    IdPregunta: string;
    Descripcion: string;
    Opcion: string;
    Puntaje: string;
    EsCorrecta: string;
    imagen: string;
}
  