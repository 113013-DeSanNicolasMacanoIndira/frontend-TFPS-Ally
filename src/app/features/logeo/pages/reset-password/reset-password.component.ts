import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:420px;margin:40px auto;padding:20px">
      <h2>Restablecer contraseña</h2>

      <div class="mb-3">
        <label class="form-label">Nueva contraseña</label>
        <input class="form-control" type="password" [(ngModel)]="newPassword" />
      </div>

      <div class="mb-3">
        <label class="form-label">Repetir contraseña</label>
        <input class="form-control" type="password" [(ngModel)]="repeatPassword" />
      </div>

      <button class="btn btn-primary w-100" (click)="onSubmit()">Guardar</button>
    </div>
  `,
})
export class ResetPasswordComponent {
  token = '';
  newPassword = '';
  repeatPassword = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  onSubmit() {
    if (!this.token) {
      Swal.fire('Error', 'Token inválido o faltante.', 'error');
      return;
    }

    if (!this.newPassword || this.newPassword.length < 4) {
      Swal.fire('Atención', 'La contraseña debe tener al menos 4 caracteres.', 'warning');
      return;
    }

    if (this.newPassword !== this.repeatPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        Swal.fire('Listo', 'Contraseña actualizada. Ahora podés iniciar sesión.', 'success');
        this.router.navigate(['/login']);
      },
      error: () => Swal.fire('Error', 'Token vencido o inválido.', 'error'),
    });
  }
}