import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';
import { TermsComponent } from '../terms/terms.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, TermsComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email = '';
  repeatEmail = '';
  password = '';
  repeatPassword = '';
  role = '';
  aceptaTerminos = false; // ✔ agregado correctamente

  constructor(private router: Router, private authService: AuthService) {}

  onRegister() {
    //  Si falta algo o no acepta términos
    if (!this.email || !this.repeatEmail || !this.password || !this.repeatPassword) {
      Swal.fire('Atención', 'Todos los campos son obligatorios.', 'warning');
      return;
    }

    //  Términos no aceptados
    if (!this.aceptaTerminos) {
      Swal.fire('Aviso', 'Debés aceptar los Términos y Condiciones.', 'warning');
      return;
    }

    //  Correos NO coinciden
    if (this.email !== this.repeatEmail) {
      Swal.fire('Error', 'Los correos electrónicos no coinciden.', 'error');
      return;
    }

    // Contraseñas NO coinciden
    if (this.password !== this.repeatPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    const userData = {
      username: this.email.split('@')[0],
      email: this.email,
      password: this.password,
      role: this.role,
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);

        // ✔ Registrar aceptación legal
        localStorage.setItem('consent', new Date().toISOString());

        Swal.fire('Éxito', 'Registro exitoso. Redirigiendo...', 'success');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        Swal.fire('Error', err.error || 'No se pudo completar el registro.', 'error');
      },
    });
  }

  onForgotPassword() {
    Swal.fire('Recuperar contraseña', 'Esta función pronto estará disponible.', 'info');
  }

  // ✔ Modal Terms & Conditions
  openModalTyC() {
    const modal: any = document.getElementById('modalTyC');
    const modalBootstrap = new (window as any).bootstrap.Modal(modal);
    modalBootstrap.show();

    modal.addEventListener(
      'hidden.bs.modal',
      () => {
        this.aceptaTerminos = true;
      },
      { once: true }
    );
  }
}
