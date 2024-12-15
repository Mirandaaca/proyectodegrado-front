import { Pregunta } from "./Pregunta";

export interface PreguntasPaginadasResponse {
    succeded: boolean;
  message: string;
  errors: any;
  data: Pregunta[];
  totalRecords: number;  // Añadimos esta propiedad
  }
  
  export interface RespuestaSeleccionada {
    idRespuesta: number;
    puntaje: number;
  }