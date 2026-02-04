import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu-paciente',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './menu-paciente.component.html',
  styleUrls: ['./menu-paciente.component.scss'],
})
export class MenuPacienteComponent {
  /** Indica si el paciente tiene solicitudes aceptadas. */
  @Input() mostrarPagos = false;

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}