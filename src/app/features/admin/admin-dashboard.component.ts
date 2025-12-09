import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from './../../services/admin.service';
import { AdminMetrics, AdminUser } from './../../models/admin.model';
import { AuthService } from './../../services/auth.service'; //  IMPORTANTE
//  IMPORTANTE: agregar el componente de gráficos
import { AdminChartsComponent } from '../../components/admin-charts/admin-charts.component';
import Swal from 'sweetalert2';
import { AdminGestionMontosComponent } from '../../components/gestion-montos/admin-gestion-montos.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule, AdminChartsComponent, AdminGestionMontosComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  metricCards: any[] = [];
  usuarios: AdminUser[] = [];

  //  Agregado para el sistema de pestañas
  tabActiva: string = 'dashboard';
  fechaDesde: string = '';
  fechaHasta: string = '';
  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
  }

  // MÉTRICAS
  loadMetrics(): void {
    this.adminService.getMetrics(this.fechaDesde, this.fechaHasta).subscribe((data: AdminMetrics) => {
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
        //  NUEVAS TARJETAS
        {
          label: 'Solicitudes Pendientes',
          value: data.solicitudesPendientes,
          icon: 'bi bi-hourglass-split',
          gradient: 'linear-gradient(135deg,#ffc107,#ff9800)',
        },
        {
          label: 'Servicios Aceptados',
          value: data.serviciosAceptados,
          icon: 'bi bi-check2-circle',
          gradient: 'linear-gradient(135deg,#28a745,#009688)',
        },
        {
          label: 'Pagos Procesados',
          value: data.pagosProcesados,
          icon: 'bi bi-cash-coin',
          gradient: 'linear-gradient(135deg,#17a2b8,#0d6efd)',
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
