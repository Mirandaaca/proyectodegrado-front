import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthData, LoginResponse } from '../../models/auth/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'auth_data';
  private authState = new BehaviorSubject<AuthData | null>(null);
  private tokenExpirationTimer: any;

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() { 
    this.checkAuthState();
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiURL}/Usuarios/LogIn`, { email, password })
      .pipe(
        tap(response => {
          if (response.succeded) {
            this.handleAuthentication(response.data);
            this.router.navigate(['/app/agenda']); // Redirigir a la agenda después del login
          }
        })
      );
  }
  private handleAuthentication(authData: AuthData) {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
    this.authState.next(authData);
    this.autoLogout(3600000); // 1 hour
  }
  logout() {
    localStorage.removeItem('auth_data');
    this.router.navigate(['/login']);
  }
  private autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
  private checkAuthState() {
    const authData = localStorage.getItem(this.AUTH_KEY);
    if (authData) {
      const parsed = JSON.parse(authData) as AuthData;
      const jwtExp = this.getTokenExpiration(parsed.jwtToken);
      
      if (jwtExp && jwtExp > new Date()) {
        this.authState.next(parsed);
        return;
      }
      this.logout();
    }
  }
  private getTokenExpiration(token: string): Date | null {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
  isAuthenticated() {
    return this.authState.value !== null;
  }

  getAuthState() {
    return this.authState.asObservable();
  }

  getToken() {
    return this.authState.value?.jwtToken;
  }
}
