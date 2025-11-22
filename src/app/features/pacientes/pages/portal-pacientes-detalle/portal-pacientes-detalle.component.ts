import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { PatientService } from '../../../../services/patient.service';

@Component({
  selector: 'portal-pacientes',
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
    if (!user || !user.id) return;

    this.patientService.getByUserId(user.id).subscribe({
      next: (patient) => {
        this.pacienteRegistrado = true;

        //  GUARDA PACIENTE PARA USAR EN "MODIFICAR"
        localStorage.setItem('paciente', JSON.stringify(patient));
      },
      error: () => {
        this.pacienteRegistrado = false;
        localStorage.removeItem('paciente');
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
