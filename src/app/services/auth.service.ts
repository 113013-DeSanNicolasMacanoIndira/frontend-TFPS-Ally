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
  // URL base del backend (usa environment y agrega /api)
  private API_URL = `${environment.apiUrl}/api`;

  
  constructor(private http: HttpClient, private router: Router) {}
  // LOGIN - envía email y password al backend
  login(email: string, password: string): Observable<any> {
    const body = { email, password };

    return this.http.post(`${this.API_URL}/auth/login`, body).pipe(
      tap((response: any) => {
        console.log('Login exitoso:', response);

        // Guardamos lo necesario para usar en la app
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userId', response.user.id);


        // Redirección automática por rol
        switch (response.role) {
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
            this.router.navigate(['/admin']);
            break;
        }
      })
    );
  }

  // REGISTRO - crea un nuevo usuario en el backend
  register(user: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/users`, user);
  }

  // Obtener usuario logueado desde localStorage
  getUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  // Saber si hay sesión activa
   isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}
