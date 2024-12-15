
 export interface DiagnosticoListado {
  idDiagnostico: number;
  nombrePostulante: string;
  fechaCita: string;
  nombreTest: string;
}

export interface RespuestaPorFactor {
  idRespuesta: number;
  respuestaSeleccionada: string | null;
  pregunta: string;
  respuesta: string;
  puntaje: number;
  calificacionPrevia: string;
  calificacionFinal: string;
}

export interface FactorRespuestas {
  nombreFactor: string;
  respuestas: RespuestaPorFactor[];
}

export interface DiagnosticoPersonalidad {
  nombrePostulante: string;
  fechaCita: string;
  edad: number;
  carrera: string;
  respuestasPorFactor: FactorRespuestas[];
}

export interface RespuestaRaven {
  idRespuesta: number;
  preguntaImagen: string;
  respuestaSeleccionadaImagen: string;
  puntaje: number;
  esCorrecta: boolean;
}

export interface DiagnosticoRaven {
  nombrePostulante: string;
  fechaCita: string;
  edad: number;
  carrera: string;
  puntajeDirecto: number;
  percentil: number;
  rango: string;
  diagnostico: string;
  respuestasSeleccionadas: RespuestaRaven[];
}