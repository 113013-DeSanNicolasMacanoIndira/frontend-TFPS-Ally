import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service'; // ⚠️ revisá que la ruta sea correcta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService) {} // ✅ inyección válida

 login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    const user = this.authService.login(this.email, this.password);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/portal-paciente';
    } else {
      this.errorMessage = 'Credenciales incorrectas';
    }
  }
}

