import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { PatientService } from '../../../../services/patient.service';

@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-paciente.component.html',
  styleUrls: ['./portal-paciente.component.scss']
})
export class PortalPacienteComponent implements OnInit {

  pacientesRegistrados = 0;
  mostrarFaq = false;

  menuServicios = false;
  menuInfo = false;
  menuPacientes = false;

  constructor(
    private auth: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientService.getTotalPacientes().subscribe({
      next: (total) => this.pacientesRegistrados = total,
      error: (err) => {
        console.error('Error al obtener el total de pacientes:', err);
        this.pacientesRegistrados = 0;
      }
    });
  }

  toggleMenu(menu: 'servicios' | 'info' | 'pacientes') {
    if (menu === 'servicios') this.menuServicios = !this.menuServicios;
    if (menu === 'info') this.menuInfo = !this.menuInfo;
    if (menu === 'pacientes') this.menuPacientes = !this.menuPacientes;
  }

  logout() {
    this.auth.logout();
  }

  abrirFaq() { this.mostrarFaq = true; }
  cerrarFaq() { this.mostrarFaq = false; }
}
