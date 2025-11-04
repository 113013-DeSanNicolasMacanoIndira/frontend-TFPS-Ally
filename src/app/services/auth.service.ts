import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajustá al backend real


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

