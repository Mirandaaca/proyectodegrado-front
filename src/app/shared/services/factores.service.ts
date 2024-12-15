import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factor, FactoresResponse } from '../../models/factores/Factor';
import { RespuestaApi } from '../../models/apiresponses/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class FactoresService {
  private urlBase = environment.apiURL + '/Factores';
  private http = inject(HttpClient);

  obtenerFactores(pagina: number, recordsPorPagina: number): Observable<FactoresResponse> {
    const params = new HttpParams()
      .set('Pagina', pagina.toString())
      .set('RecordsPorPagina', recordsPorPagina.toString());

    return this.http.get<Factor[]>(this.urlBase + '/ObtenerFactores', {
      observe: 'response',
      params
    }).pipe(
      map(response => ({
        factores: response.body ?? [],
        totalRecords: Number(response.headers.get('cantidad-total-registros') ?? 0)
      }))
    );
  }

  obtenerPorId(id: number): Observable<Factor> {
    return this.http.get<Factor>(`${this.urlBase}/ObtenerFactorPorId?id=${id}`);
  }
  obtenerFactoresPorNombre(nombre: string): Observable<Factor[]> {
    const params = new HttpParams().set('nombre', nombre);
    
    return this.http.get<Factor[]>(`${this.urlBase}/ObtenerFactoresPorNombre`, {
      params
    });
  }
  crear(factor: Factor): Observable<RespuestaApi<boolean>> {
    return this.http.post<RespuestaApi<boolean>>(`${this.urlBase}/GuardarFactor`, factor);
  }

  actualizar(factor: Factor): Observable<RespuestaApi<boolean>> {
    return this.http.put<RespuestaApi<boolean>>(`${this.urlBase}/ActualizarFactor`, factor);
  }

  eliminar(id: number): Observable<RespuestaApi<boolean>> {
    return this.http.delete<RespuestaApi<boolean>>(`${this.urlBase}/EliminarFactor?id=${id}`);
  }
}