import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-portal-pacientes-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './portal-pacientes-detalle.component.html',
  styleUrls: ['./portal-pacientes-detalle.component.scss']
  
})
export class PortalPacientesDetalleComponent {}
