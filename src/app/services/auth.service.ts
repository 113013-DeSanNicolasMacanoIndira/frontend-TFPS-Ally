import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

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
  providedIn: 'root',
})
export class AuthService {
  // Ajustá al backend real

  // URL base del backend (usa environment y agrega /api)

  private API_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private router: Router) {}

  // LOGIN - envía email y password al backend

  // -----------------------------
  // LOGIN
  // -----------------------------

  login(email: string, password: string): Observable<any> {
    const body = { email, password };

    return this.http.post(`${this.API_URL}/auth/login`, body).pipe(
      tap((response: any) => {
        console.log('Login exitoso:', response);

        // Guardar datos esenciales
        localStorage.setItem('token', response.token ?? 'dummy-token');
        localStorage.setItem('role', response.role);
        localStorage.setItem('user', JSON.stringify(response.usuario));
        localStorage.setItem('userId', String(response.usuario.id));

        // Redirección automática según rol
        this.redirectByRole(response.role);
      })
    );
  }

  // -----------------------------
  // REGISTRO
  // -----------------------------
  register(user: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/users`, user);
  }

  // -----------------------------
  // OBTENER USUARIO LOGUEADO
  // -----------------------------
  getUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  // -----------------------------
  // ESTADO DE SESIÓN
  // -----------------------------
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

    this.router.navigate(['/login']);
  }

  // -----------------------------
  // REDIRECCIÓN POR ROL
  // -----------------------------
  private redirectByRole(role: string): void {
    switch (role) {
      case 'PACIENTE':
        this.router.navigate(['/portal-paciente']);
        break;

      case 'PRESTADOR':
        this.router.navigate(['/portal-prestador']);
        break;

      case 'TRANSPORTISTA':
        this.router.navigate(['/portal-transportista']);
        break;

      case 'ADMIN':
        this.router.navigate(['/admin-dashboard']);
        break;

      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
