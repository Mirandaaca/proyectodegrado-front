import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Usuario, UsuarioResponse, UsuariosResponse } from '../../models/usuario/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiURL}/Usuarios`;

  obtenerUsuarios(): Observable<UsuariosResponse> {
    return this.http.get<UsuariosResponse>(`${this.baseUrl}/ObtenerUsuarios`);
  }

  obtenerPorId(id: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.baseUrl}/${id}`);
  }

  crear(usuario: Usuario): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.baseUrl}/CrearUsuario`, usuario);
  }

  actualizar(id: string, usuario: Usuario): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, usuario);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  generarReportePDF(usuarios: Usuario[]): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/GenerarReporte`, { usuarios }, {
      responseType: 'blob'
    });
  }
}