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
  imports: [FormsModule, CommonModule, RouterLink],
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
      Swal.fire('Aviso', 'Debés aceptar los Términos y Condiciones.', 'warning');
      return;
    }
    //  LOGIN DE EMERGENCIA PARA ADMIN 
    // Si el backend falla, esto permite entrar al panel admin
    if (this.email === 'admin@ally.com' && this.password === '1234A') {
      localStorage.setItem('role', 'ADMIN');
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 0,
          username: 'Administrador',
          email: this.email,
          role: 'ADMIN',
        })
      );

      Swal.fire('Bienvenido', 'Acceso administrador', 'success');
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        const role = response.role ?? response.usuario?.role;

        if (role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'PACIENTE') {
          this.router.navigate(['/portal-paciente']);
        } else if (role === 'PRESTADOR') {
          this.router.navigate(['/portal-prestador']);
        } else if (role === 'TRANSPORTISTA') {
          this.router.navigate(['/portal-transportista']);
        } else {
          Swal.fire('Error', 'Rol desconocido', 'error');
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
    modal.addEventListener(
      'hidden.bs.modal',
      () => {
        this.aceptaTerminos = true;
      },
      { once: true }
    );
  }
}
