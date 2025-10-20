import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email: string = '';
  repeatEmail: string = '';
  password: string = '';
  repeatPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onRegister() {
    // Validaciones simples
    if (this.email !== this.repeatEmail) {
      this.errorMessage = 'Los correos no coinciden';
      this.successMessage = '';
      return;
    }

    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.successMessage = '';
      return;
    }

    // Simulación de registro
    const newUser = { email: this.email, password: this.password };
    localStorage.setItem('user', JSON.stringify(newUser));

    this.errorMessage = '';
    this.successMessage = 'Registro exitoso , Redirigiendo...';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
