import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Postulante, PostulantesResponse } from '../../models/postulantes/Postulante';

@Injectable({
  providedIn: 'root'
})
export class PostulantesService {
  private urlBase = environment.apiURL + '/Postulantes';
  private http = inject(HttpClient);
  constructor() { }
  obtenerPostulantes(pagina: number, recordsPorPagina: number): Observable<PostulantesResponse> {
    const params = new HttpParams()
      .set('Pagina', pagina.toString())
      .set('RecordsPorPagina', recordsPorPagina.toString());

    return this.http.get<Postulante[]>(this.urlBase + '/ObtenerPostulantes', {
      observe: 'response',
      params
    }).pipe(
      map(response => ({
        postulantes: response.body ?? [],
        totalRecords: Number(response.headers.get('cantidad-total-registros') ?? 0)
      }))
    );
  }
  obtenerPorId(id: number): Observable<Postulante> {
    return this.http.get<Postulante>(`${this.urlBase}/ObtenerPostulantePorId?id=${id}`);
  }

  crear(postulante: Postulante): Observable<void> {
    return this.http.post<void>(`${this.urlBase}/GuardarPostulante`, postulante);
  }

  actualizar(postulante: Postulante): Observable<void> {
    return this.http.put<void>(`${this.urlBase}/ActualizarPostulante`, postulante);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/EliminarPostulante?id=${id}`);
  }
  obtenerPostulantesPorNombre(nombre: string): Observable<Postulante[]> {
    return this.http.get<Postulante[]>(`${this.urlBase}/ObtenerPostulantesPorNombre`, {
      params: {
        nombre: nombre
      }
    });
  }
}
