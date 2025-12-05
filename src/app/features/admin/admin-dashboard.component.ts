import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from './../../services/admin.service';
import { AdminMetrics, AdminUser } from './../../models/admin.model';
import { AuthService } from './../../services/auth.service'; //  IMPORTANTE

import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  metricCards: any[] = [];
  usuarios: AdminUser[] = [];

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
  }

  // MÉTRICAS
  loadMetrics(): void {
    this.adminService.getMetrics().subscribe((data: AdminMetrics) => {
      this.metricCards = [
        {
          label: 'Pacientes',
          value: data.pacientes,
          icon: 'bi bi-people',
          gradient: 'linear-gradient(135deg,#007bff,#0dcaf0)',
        },
        {
          label: 'Prestadores',
          value: data.prestadores,
          icon: 'bi bi-person-badge',
          gradient: 'linear-gradient(135deg,#6610f2,#6f42c1)',
        },
        {
          label: 'Transportistas',
          value: data.transportistas,
          icon: 'bi bi-truck',
          gradient: 'linear-gradient(135deg,#20c997,#198754)',
        },
        {
          label: 'Admins Activos',
          value: data.admins,
          icon: 'bi bi-shield-lock',
          gradient: 'linear-gradient(135deg,#fd7e14,#dc3545)',
        },
      ];
    });
  }

  //  USUARIOS
  loadUsers(): void {
    this.adminService.getUsers().subscribe((data: AdminUser[]) => {
      this.usuarios = data;
    });
  }

  //  BLOQUEAR / ACTIVAR con alerta
  toggleEstado(u: AdminUser) {
    this.adminService.toggleUser(u.id).subscribe({
      next: (updated) => {
        u.activo = updated.activo; // actualizar la tabla sin recargar

        Swal.fire({
          icon: updated.activo ? 'success' : 'warning',
          title: updated.activo ? 'Usuario Activado' : 'Usuario Bloqueado',
          text: `${u.nombre} ahora está ${updated.activo ? 'activo' : 'bloqueado'}.`,
          timer: 1800,
          showConfirmButton: false,
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
      },
    });
  }

  //  CERRAR SESIÓN
  logout(): void {
    this.authService.logout();
  }
}
