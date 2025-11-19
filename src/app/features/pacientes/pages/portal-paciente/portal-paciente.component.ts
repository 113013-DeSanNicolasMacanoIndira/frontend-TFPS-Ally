import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './portal-paciente.component.html',
  styleUrls: ['./portal-paciente.component.scss']
})
export class PortalPacienteComponent {
  mostrarFaq = false;

  constructor(private auth: AuthService) {}

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

