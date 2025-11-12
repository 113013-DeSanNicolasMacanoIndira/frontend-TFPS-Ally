import { Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  username?: string;
  email: string;
  password?: string;
  role?: string;
  active?: boolean;
  locked?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Ajustá al backend real


  // URL base del backend (usa environment y agrega /api)
  private API_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}


  // LOGIN - envía email y password al backend
  login(email: string, password: string): Observable<any> {
    const body = { email, password }; // coincide con AuthController del backend

    return this.http.post(`${this.API_URL}/auth/login`, body)
      .pipe(
        tap((response: any) => {
          console.log('Login exitoso:', response);

          // Guarda el usuario logueado en localStorage
          localStorage.setItem('user', JSON.stringify(response.usuario));
        })
      );
  }

  // REGISTRO - crea un nuevo usuario en el backend
  register(user: { username: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/users`, user);
  }

  // Obtener usuario logueado desde localStorage
  getUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  // Saber si hay sesión activa
  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('user');
  }
}
