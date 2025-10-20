import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  //login() {
  //  this.authService.login(this.email, this.password).subscribe({
  //    next: (user: any) => {
  //      this.authService.saveUser(user);
   //     this.router.navigate(['/portal-paciente']);
  //    },
   //   error: () => {
    //    this.error = 'Credenciales incorrectas';
   //   }
  //  });
 // }
  onLogin() {
    const success = this.authService.login(this.email, this.password);

    if (success) {
      this.router.navigate(['/portal-paciente']);
    } else {
      this.error = 'Credenciales incorrectas';
    }
  }
   goToRegister() {
    this.router.navigate(['/register']);
  }

  onForgotPassword() {
    alert('🔐 Recuperar contraseña: esta función estará disponible próximamente.');
  }
}
