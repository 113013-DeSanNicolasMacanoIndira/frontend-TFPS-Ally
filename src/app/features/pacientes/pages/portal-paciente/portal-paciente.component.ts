import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-paciente.component.html',
  styleUrls: ['./portal-paciente.component.scss']
})
export class PortalPacienteComponent {
  // Pacientes registrados (mock por ahora)
  pacientesRegistrados = 54;
  // FAQ
  mostrarFaq = false;

  // Menús del sidebar
  menuServicios = false;
  menuInfo = false;
  menuPacientes = false;

  constructor(private auth: AuthService) {}

  // Abre/cierra submenús
  toggleMenu(menu: 'servicios' | 'info' | 'pacientes') {
    if (menu === 'servicios') this.menuServicios = !this.menuServicios;
    if (menu === 'info') this.menuInfo = !this.menuInfo;
    if (menu === 'pacientes') this.menuPacientes = !this.menuPacientes;
  }

  logout() {
    this.auth.logout();
  }

  abrirFaq() {
    this.mostrarFaq = true;
  }

  cerrarFaq() {
    this.mostrarFaq = false;
  }
}
