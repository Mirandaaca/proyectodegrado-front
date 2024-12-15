import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pregunta } from '../../models/preguntas/Pregunta';
import { RespuestaApi } from '../../models/apiresponses/apiresponse';
import { PostulanteCita } from '../../models/postulantes/PostulantCita';

@Injectable({
  providedIn: 'root'
})
export class TestRavenService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiURL;
  readonly TEST_ID = 3; // ID fijo para Test Raven

  obtenerPreguntas(): Observable<Pregunta[]> {
    return this.http.get<Pregunta[]>(`${this.baseUrl}/Preguntas/ObtenerPreguntasConRespuestasDeTest/${this.TEST_ID}`);
  }

  crearPregunta(formData: FormData): Observable<RespuestaApi<void>> {
    return this.http.post<RespuestaApi<void>>(`${this.baseUrl}/Preguntas/CrearPregunta`, formData);
  }

  actualizarPregunta(formData: FormData): Observable<RespuestaApi<void>> {
    return this.http.put<RespuestaApi<void>>(`${this.baseUrl}/Preguntas/ActualizarPregunta`, formData);
  }

  eliminarPregunta(id: number): Observable<RespuestaApi<void>> {
    return this.http.delete<RespuestaApi<void>>(`${this.baseUrl}/Preguntas/EliminarPregunta?id=${id}`);
  }

  crearRespuesta(formData: FormData): Observable<RespuestaApi<void>> {
    return this.http.post<RespuestaApi<void>>(`${this.baseUrl}/Respuestas/CrearRespuesta`, formData);
  }

  actualizarRespuesta(formData: FormData): Observable<RespuestaApi<void>> {
    return this.http.put<RespuestaApi<void>>(`${this.baseUrl}/Respuestas/ActualizarRespuesta`, formData);
  }

  eliminarRespuesta(id: number): Observable<RespuestaApi<void>> {
    return this.http.delete<RespuestaApi<void>>(`${this.baseUrl}/Respuestas/EliminarRespuesta?id=${id}`);
  }

  actualizarOrdenPreguntas(preguntas: { id: number, orden: number }[]): Observable<RespuestaApi<void>> {
    return this.http.put<RespuestaApi<void>>(`${this.baseUrl}/Preguntas/ActualizarOrdenPreguntas`, preguntas);
  }

  actualizarOrdenRespuestas(respuestas: { id: number, orden: number }[]): Observable<RespuestaApi<void>> {
    return this.http.put<RespuestaApi<void>>(`${this.baseUrl}/Respuestas/ActualizarOrdenRespuestas`, respuestas);
  }

  reordenarRespuestas(preguntaId: number): Observable<RespuestaApi<void>> {
    return this.http.post<RespuestaApi<void>>(`${this.baseUrl}/Respuestas/ReordenarRespuestas/${preguntaId}`, {});
  }

  reordenarPreguntas(): Observable<RespuestaApi<void>> {
    return this.http.post<RespuestaApi<void>>(`${this.baseUrl}/Preguntas/ReordenarPreguntas/${this.TEST_ID}`, {});
  }
  obtenerPostulantesDisponibles(): Observable<PostulanteCita[]> {
    return this.http.get<PostulanteCita[]>(
      `${this.baseUrl}/Citas/ObtenerPostulantesConCitasPendientesOEnProceso`
    );
  }
  enviarCorreoTest(idCita: number, testId: number): Observable<any> {
    const params = new HttpParams()
      .set('idCita', idCita.toString())
      .set('idTestPsicotecnico', testId.toString());

    return this.http.post(
      `${this.baseUrl}/Citas/EnviarCorreoParaTestDeRaven`,
      null,
      { params }
    );
  }
}