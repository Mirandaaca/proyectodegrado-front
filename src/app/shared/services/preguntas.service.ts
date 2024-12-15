// services/preguntas.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pregunta, CrearPreguntaRequest } from '../../models/preguntas/Pregunta';

interface OrdenItem {
  id: number;
  orden: number;
}

@Injectable({
  providedIn: 'root'
})
export class PreguntasService {
  private urlBase = environment.apiURL;
  private http = inject(HttpClient);

  // Preguntas
  obtenerPreguntasConRespuestas(idTest: number): Observable<Pregunta[]> {
    return this.http.get<Pregunta[]>(`${this.urlBase}/Preguntas/ObtenerPreguntasConRespuestasDeTest/${idTest}`);
  }

  crearPregunta(pregunta: any): Observable<any> {
    // Crear FormData
    const formData = new FormData();
    
    // Añadir campos obligatorios
    formData.append('IdTestPsicotecnico', pregunta.idTestPsicotecnico.toString());
    formData.append('Enunciado', pregunta.enunciado);
    
    // Si hay idFactor (es opcional)
    if (pregunta.idFactor) {
      formData.append('IdFactor', pregunta.idFactor.toString());
    }
  
    // Si hay imagen
    if (pregunta.imagen) {
      formData.append('imagen', pregunta.imagen);
    }
  
    return this.http.post(`${this.urlBase}/Preguntas/CrearPregunta`, formData);
  }

  actualizarPregunta(pregunta: any): Observable<any> {
    const formData = new FormData();
    
    // Añadir campos obligatorios
    formData.append('Id', pregunta.id.toString());
    formData.append('Enunciado', pregunta.enunciado);
    formData.append('Orden', pregunta.orden.toString());
    
    // Si hay idFactor (es opcional)
    if (pregunta.idFactor) {
      formData.append('IdFactor', pregunta.idFactor.toString());
    }
  
    // Si hay nueva imagen
    if (pregunta.nuevaImagen) {
      formData.append('nuevaImagen', pregunta.nuevaImagen);
    }
  
    return this.http.put(`${this.urlBase}/Preguntas/ActualizarPregunta`, formData);
  }

  eliminarPregunta(id: number): Observable<any> {
    return this.http.delete(`${this.urlBase}/Preguntas/EliminarPregunta?id=${id}`);
  }

  actualizarOrdenPreguntas(ordenItems: OrdenItem[]): Observable<any> {
    return this.http.put(`${this.urlBase}/Preguntas/ActualizarOrdenPreguntas`, ordenItems);
  }

  reordenarPreguntas(idTest: number): Observable<any> {
    return this.http.post(`${this.urlBase}/Preguntas/ReordenarPreguntas/${idTest}`, {});
  }

  // Respuestas
  crearRespuesta(respuesta: any): Observable<any> {
    // Crear FormData
    const formData = new FormData();
    formData.append('IdPregunta', respuesta.IdPregunta);
    formData.append('Descripcion', respuesta.Descripcion);
    formData.append('Opcion', respuesta.Opcion);
    formData.append('Puntaje', respuesta.Puntaje);
    
    // Si hay imagen, añadirla
    if (respuesta.imagen) {
      formData.append('imagen', respuesta.imagen);
    }
  
    // Si hay EsCorrecta, añadirlo
    if (respuesta.EsCorrecta !== undefined) {
      formData.append('EsCorrecta', respuesta.EsCorrecta);
    }
  
    return this.http.post(`${this.urlBase}/Respuestas/CrearRespuesta`, formData);
  }

  actualizarRespuesta(respuesta: any): Observable<any> {
    // Crear FormData
    const formData = new FormData();
    
    // Añadir todos los campos necesarios
    formData.append('Id', respuesta.Id);
    formData.append('Descripcion', respuesta.Descripcion);
    formData.append('Opcion', respuesta.Opcion);
    formData.append('Puntaje', respuesta.Puntaje);
    
    // Campos opcionales
    if (respuesta.EsCorrecta !== undefined) {
      formData.append('EsCorrecta', respuesta.EsCorrecta);
    }
    
    if (respuesta.IndiceRaven !== undefined) {
      formData.append('IndiceRaven', respuesta.IndiceRaven);
    }
  
    // Si hay nueva imagen
    if (respuesta.nuevaImagen) {
      formData.append('nuevaImagen', respuesta.nuevaImagen);
    }
  
    return this.http.put(`${this.urlBase}/Respuestas/ActualizarRespuesta`, formData);
  }

  eliminarRespuesta(id: number): Observable<any> {
    return this.http.delete(`${this.urlBase}/Respuestas/EliminarRespuesta?id=${id}`);
  }

  actualizarOrdenRespuestas(ordenItems: OrdenItem[]): Observable<any> {
    return this.http.put(`${this.urlBase}/Respuestas/ActualizarOrdenRespuestas`, ordenItems);
  }

  reordenarRespuestas(idPregunta: number): Observable<any> {
    return this.http.post(`${this.urlBase}/Respuestas/ReordenarRespuestas/${idPregunta}`, {});
  }
}