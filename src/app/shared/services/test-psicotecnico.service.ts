import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaApi } from '../../models/apiresponses/apiresponse';
import { TestPsicotecnico, TestPsicotecnicosResponse } from '../../models/test-psicotecnicos/TestPsicotecnico';

@Injectable({
  providedIn: 'root'
})
export class TestPsicotecnicoService {
  private urlBase = environment.apiURL + '/TestPsicotecnicos';
  private http = inject(HttpClient);

  obtenerTests(pagina: number, recordsPorPagina: number): Observable<TestPsicotecnicosResponse> {
    const params = new HttpParams()
      .set('Pagina', pagina.toString())
      .set('RecordsPorPagina', recordsPorPagina.toString());

    return this.http.get<TestPsicotecnico[]>(this.urlBase + '/ObtenerTestPsicotecnicos', {
      observe: 'response',
      params
    }).pipe(
      map(response => ({
        tests: response.body ?? [],
        totalRecords: Number(response.headers.get('cantidad-total-registros') ?? 0)
      }))
    );
  }

  obtenerPorId(id: number): Observable<TestPsicotecnico> {
    return this.http.get<TestPsicotecnico>(`${this.urlBase}/ObtenerTestPsicotecnicoPorId?id=${id}`);
  }

  crear(test: TestPsicotecnico): Observable<RespuestaApi<boolean>> {
    return this.http.post<RespuestaApi<boolean>>(`${this.urlBase}/GuardarTestPsicotecnico`, test);
  }

  actualizar(test: TestPsicotecnico): Observable<RespuestaApi<boolean>> {
    return this.http.put<RespuestaApi<boolean>>(`${this.urlBase}/ActualizarTestPsicotecnico`, test);
  }

  eliminar(id: number): Observable<RespuestaApi<boolean>> {
    return this.http.delete<RespuestaApi<boolean>>(`${this.urlBase}/EliminarTestPsicotecnico?id=${id}`);
  }
}