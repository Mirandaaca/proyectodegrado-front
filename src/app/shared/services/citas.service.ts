import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cita } from '../../models/citas/Cita';
import { RespuestaApi } from '../../models/apiresponses/apiresponse';
import { Postulante } from '../../models/postulantes/Postulante';
import { AuthData } from '../../models/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiURL}/Citas`;
  //private idUsuario = localStorage.getItem('auth_data');
  private obtenerIdUsuario(): string {
    const authDataString = localStorage.getItem('auth_data');
    if (authDataString) {
      try {
        const authData: AuthData = JSON.parse(authDataString);
        return authData.idUsuario;
      } catch (e) {
        console.error('Error al parsear auth_data:', e);
        return '';
      }
    }
    return '';
  }
  obtenerCitas(): Observable<RespuestaApi<Cita[]>> {
    return this.http.get<RespuestaApi<Cita[]>>(`${this.baseUrl}/ObtenerCitas`);
  }

  obtenerCitasDeHoy(): Observable<RespuestaApi<Cita[]>> {
    return this.http.get<RespuestaApi<Cita[]>>(`${this.baseUrl}/ObtenerCitasDelDia`);
  }

  obtenerCitasDeManana(): Observable<RespuestaApi<Cita[]>> {
    return this.http.get<RespuestaApi<Cita[]>>(`${this.baseUrl}/ObtenerCitasDeManana`);
  }

  obtenerCitasDeLaSemana(): Observable<RespuestaApi<Cita[]>> {
    return this.http.get<RespuestaApi<Cita[]>>(`${this.baseUrl}/ObtenerCitasDeLaSemanaActual`);
  }

  obtenerCitasDelMes(): Observable<RespuestaApi<Cita[]>> {
    return this.http.get<RespuestaApi<Cita[]>>(`${this.baseUrl}/ObtenerCitasDelMesActual`);
  }

  obtenerCitasDelProximoMes(): Observable<RespuestaApi<Cita[]>> {
    return this.http.get<RespuestaApi<Cita[]>>(`${this.baseUrl}/ObtenerCitasDelProximoMes`);
  }
  obtenerCitasPaginadas(pagina: number, recordsPorPagina: number): Observable<any> {
    const params = new HttpParams()
      .set('Pagina', pagina.toString())
      .set('RecordsPorPagina', recordsPorPagina.toString());

    return this.http.get<Cita[]>(`${this.baseUrl}/ObtenerCitasPaginadas`, {
      observe: 'response',
      params
    }).pipe(
      map(response => ({
        citas: response.body ?? [],
        totalRecords: Number(response.headers.get('cantidad-total-registros') ?? 0)
      }))
    );
  }
  obtenerCitasEnRango(fechaInicio: Date, fechaFin: Date): Observable<RespuestaApi<Cita[]>> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio.toISOString())
      .set('fechaFin', fechaFin.toISOString());

    return this.http.get<RespuestaApi<Cita[]>>(`${this.baseUrl}/ObtenerCitasEnRango`, { params });
  }
  crearCita(cita: Partial<Cita>): Observable<any> {
    const citaConUsuario = {
      ...cita,
      idUsuario: this.obtenerIdUsuario()
    };
    return this.http.post(`${this.baseUrl}/CrearCita`, citaConUsuario);
  }

  actualizarCita(cita: Cita): Observable<RespuestaApi<Cita>> {
    return this.http.put<RespuestaApi<Cita>>(`${this.baseUrl}/ActualizarCita`, cita);
  }

  eliminarCita(id: number): Observable<RespuestaApi<void>> {
    return this.http.delete<RespuestaApi<void>>(`${this.baseUrl}/EliminarCita?id=${id}`);
  }
  obtenerCitaPorId(id: number): Observable<RespuestaApi<Cita>> {
    return this.http.get<RespuestaApi<Cita>>(`${this.baseUrl}/ObtenerCitaPorId?id=${id}`);
  }
 
}
