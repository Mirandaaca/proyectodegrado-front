import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PreguntasPaginadasResponse, RespuestaSeleccionada } from '../../models/preguntas/PreguntasPaginadas';
import { PostulanteCita } from '../../models/postulantes/PostulantCita';

@Injectable({
  providedIn: 'root'
})
export class TestPersonalidadService {
  private urlBase = environment.apiURL;
  private http = inject(HttpClient);

  obtenerPostulantesDisponibles(): Observable<PostulanteCita[]> {
    return this.http.get<PostulanteCita[]>(
      `${this.urlBase}/Citas/ObtenerPostulantesConCitasPendientesOEnProceso`
    );
  }

  obtenerPreguntasPaginadas(idTest: number, pagina: number, recordsPorPagina: number): Observable<PreguntasPaginadasResponse> {
    const params = new HttpParams()
      .set('Pagina', pagina.toString())
      .set('RecordsPorPagina', recordsPorPagina.toString());

    return this.http.get<PreguntasPaginadasResponse>(
      `${this.urlBase}/Preguntas/ObtenerPreguntasConRespuestasDeTestPaginadas/${idTest}`,
      { params }
    );
  }

  enviarCorreoTest(idCita: number, idTestPsicotecnico: number): Observable<any> {
    const params = new HttpParams()
      .set('idCita', idCita.toString())
      .set('idTestPsicotecnico', idTestPsicotecnico.toString());

    return this.http.post(
      `${this.urlBase}/Citas/EnviarCorreoParaTestDePersonalidad`,
      null,
      { params }
    );
  }

  resolverTest(data: {
    idCita: number;
    idTestPsicotecnico: number;
    respuestasSeleccionadas: RespuestaSeleccionada[];
  }): Observable<any> {
    return this.http.post(
      `${this.urlBase}/Diagnostico/ResolverTestDePersonalidad`,
      data
    );
  }
}