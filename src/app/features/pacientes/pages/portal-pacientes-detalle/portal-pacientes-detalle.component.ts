import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { PatientService } from '../../../../services/patient.service';

@Component({
  selector: 'app-portal-pacientes-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './portal-pacientes-detalle.component.html',
  styleUrls: ['./portal-pacientes-detalle.component.scss'],
})
export class PortalPacientesDetalleComponent implements OnInit {
  pacienteRegistrado = false;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user || !user.id) return; // <-- AQUI VALIDAMOS QUE TENGA ID

    this.patientService.getByUserId(user.id).subscribe({
      next: () => {
        this.pacienteRegistrado = true;
      },
      error: () => {
        this.pacienteRegistrado = false;
      },
    });
  }

  irARegistrar() {
    this.router.navigate(['/registrar']);
  }

  irAModificar() {
    this.router.navigate(['/modificar-paciente']);
  }

  irASolicitudes() {
    this.router.navigate(['/solicitudes-paciente']);
  }
}
