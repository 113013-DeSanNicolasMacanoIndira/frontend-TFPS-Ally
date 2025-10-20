import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http'; // 👈 lo usaremos después
// import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private API_URL = 'http://localhost:8080/api/usuarios'; // 👈 luego se usará esto
  // Ajustá al backend real

  // constructor(private http: HttpClient) {}
  constructor() {}

  // 🔐 LOGIN SIMULADO (sin backend)
  login(email: string, password: string) {
    // simular credenciales válidas
    if (email === 'test@ally.com' && password === '1234') {
      const mockUser = { email, nombre: 'Usuario Demo', rol: 'PACIENTE' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  logout() {
    localStorage.removeItem('user');
  }
}

