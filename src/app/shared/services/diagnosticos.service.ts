import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  DiagnosticoListado, 
  DiagnosticoPersonalidad,
  DiagnosticoRaven 
} from '../../models/diagnosticos/diagnostico';
import { RespuestaApi } from '../../models/apiresponses/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiURL}/Diagnostico`;

  obtenerDiagnosticos(idTestPsicotecnico: number, filtros?: any): Observable<DiagnosticoListado[]> {
    let params = new HttpParams()
      .set('idTestPsicotecnico', idTestPsicotecnico.toString());

    if (filtros) {
      if (filtros.busqueda) {
        params = params.set('busqueda', filtros.busqueda);
      }
      if (filtros.fechaInicio) {
        params = params.set('fechaInicio', filtros.fechaInicio.toISOString());
      }
      if (filtros.fechaFin) {
        params = params.set('fechaFin', filtros.fechaFin.toISOString());
      }
    }

    return this.http.get<DiagnosticoListado[]>(`${this.baseUrl}/ObtenerDiagnosticos`, { params });
  }

  obtenerDetalleDiagnosticoPersonalidad(id: number): Observable<DiagnosticoPersonalidad> {
    return this.http.get<DiagnosticoPersonalidad>(
      `${this.baseUrl}/ObtenerDetalleDiagnosticoTestDePersonalidad/${id}`
    );
  }

  obtenerDetalleDiagnosticoRaven(id: number): Observable<DiagnosticoRaven> {
    return this.http.get<DiagnosticoRaven>(
      `${this.baseUrl}/ObtenerDetalleDiagnosticoTestRaven/${id}`
    );
  }

  generarReportePDF(diagnosticos: DiagnosticoListado[], filtros: any, tipoTest: string): Observable<Blob> {
    const data = {
      diagnosticos,
      filtros,
      tipoTest
    };

    return this.http.post(`${this.baseUrl}/GenerarReportePDF`, data, {
      responseType: 'blob'
    });
  }
}