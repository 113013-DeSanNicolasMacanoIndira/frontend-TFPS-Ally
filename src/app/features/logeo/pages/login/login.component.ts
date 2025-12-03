import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';

declare const bootstrap: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  aceptaTerminos: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      Swal.fire('Atención', 'Completá todos los campos.', 'warning');
      return;
    }

    if (!this.aceptaTerminos) {
      Swal.fire('Aviso', 'Debés aceptar los Términos y Condiciones para continuar.', 'warning');
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        localStorage.setItem('consent', new Date().toISOString()); // Guardar consentimiento

        Swal.fire('Bienvenido', 'Inicio de sesión exitoso', 'success');

        const rol = localStorage.getItem('role');
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
      error: () => {
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
 openModalTyC() {
  const modal: any = document.getElementById('modalTyC');
  const modalBootstrap = new (window as any).bootstrap.Modal(modal);
  modalBootstrap.show();

  // Cuando cierre el modal → auto-check
  modal.addEventListener('hidden.bs.modal', () => {
    this.aceptaTerminos = true;
  }, { once: true });
 }

}








