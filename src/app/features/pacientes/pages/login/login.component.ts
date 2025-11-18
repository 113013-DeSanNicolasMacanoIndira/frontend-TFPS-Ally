import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

 onLogin() {
  if (!this.email || !this.password) {
    Swal.fire('Atención', 'Completá todos los campos.', 'warning');
    return;
  }

  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      Swal.fire('Bienvenido', 'Inicio de sesión exitoso', 'success');

      const rol = localStorage.getItem('role');

      // REDIRECCIÓN AUTOMÁTICA POR ROL
      switch (rol) {
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

        default:
          this.router.navigate(['/login']);
          break;
      }
    },
    error: (err) => {
      console.error('Error en login:', err);
      this.error = 'Credenciales incorrectas o usuario inexistente';
      Swal.fire('Error', this.error, 'error');
    },
  });
}


  goToRegister() {
    this.router.navigate(['/register']);
  }

  onForgotPassword() {
    Swal.fire(' Recuperar contraseña', 'Esta función estará disponible próximamente.', 'info');
  }
}
