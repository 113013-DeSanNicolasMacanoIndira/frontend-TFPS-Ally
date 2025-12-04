import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [CommonModule],
})
export class AdminDashboardComponent {
  metricCards = [
    {
      label: 'Pacientes',
      value: 10,
      icon: 'bi bi-people',
      gradient: 'linear-gradient(135deg,#007bff,#0dcaf0)',
    },

    {
      label: 'Prestadores',
      value: 5,
      icon: 'bi bi-person-badge',
      gradient: 'linear-gradient(135deg,#6610f2,#6f42c1)',
    },

    {
      label: 'Transportistas',
      value: 3,
      icon: 'bi bi-truck',
      gradient: 'linear-gradient(135deg,#20c997,#198754)',
    },

    {
      label: 'Admins Activos',
      value: 2,
      icon: 'bi bi-shield-lock',
      gradient: 'linear-gradient(135deg,#fd7e14,#dc3545)',
    },
  ];

  usuarios = [
    { id: 1, nombre: 'Juan Pérez', rol: 'Paciente', activo: true },
    { id: 2, nombre: 'Laura Gómez', rol: 'Prestador', activo: false },
    { id: 3, nombre: 'Carlos Ruiz', rol: 'Transportista', activo: true },
  ];

  toggleEstado(usuario: any) {
    usuario.activo = !usuario.activo;
    console.log('Nuevo estado:', usuario);
  }
}
