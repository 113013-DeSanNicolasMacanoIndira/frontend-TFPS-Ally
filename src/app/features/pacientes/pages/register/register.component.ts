import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email = '';
  repeatEmail = '';
  password = '';
  repeatPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

 onRegister() {
  // Validaciones básicas
  if (!this.email || !this.repeatEmail || !this.password || !this.repeatPassword) {
    Swal.fire('Atención', 'Todos los campos son obligatorios.', 'warning');
    return;
  }

  if (this.email !== this.repeatEmail) {
    Swal.fire('Error', 'Los correos electrónicos no coinciden.', 'error');
    return;
  }

  if (this.password !== this.repeatPassword) {
    Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
    return;
  }

  // 👇 Aquí cambiamos "rol" → "role"
  const userData = {
    username: this.email.split('@')[0],
    email: this.email,
    password: this.password,
    role: 'PACIENTE'  // 👈 esto coincide con tu DTO en el backend
  };

  this.authService.register(userData).subscribe({
    next: (response) => {
      console.log('✅ Usuario registrado:', response);
      Swal.fire('Éxito', 'Registro exitoso. Redirigiendo...', 'success');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    },
    error: (err) => {
      console.error('❌ Error en registro:', err);
      if (err.status === 400) {
        Swal.fire('Error', 'El correo o usuario ya está registrado.', 'error');
      } else {
        Swal.fire('Error', 'No se pudo completar el registro.', 'error');
      }
    }
  });
 }
}
