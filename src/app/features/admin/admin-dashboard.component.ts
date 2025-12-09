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
  imports: [CommonModule, FormsModule, AdminChartsComponent, AdminGestionMontosComponent],
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
  listaDetalle: any[] = [];
  tituloDetalle: string = '';
  mostrarDetalle: boolean = false;
  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
  }

  // MÉTRICAS
  loadMetrics(): void {
    this.adminService
      .getMetrics(this.fechaDesde, this.fechaHasta)
      .subscribe((data: AdminMetrics) => {
        this.metricCards = [
          {
            label: 'Pacientes',
            value: data.pacientes,
            icon: 'bi bi-people',
            gradient: 'linear-gradient(135deg,#007bff,#0dcaf0)',
            action: 'pacientes',
          },
          {
            label: 'Prestadores',
            value: data.prestadores,
            icon: 'bi bi-person-badge',
            gradient: 'linear-gradient(135deg,#6610f2,#6f42c1)',
            action: 'prestadores',
          },
          {
            label: 'Transportistas',
            value: data.transportistas,
            icon: 'bi bi-truck',
            gradient: 'linear-gradient(135deg,#20c997,#198754)',
            action: 'transportistas',
          },
          {
            label: 'Admins Activos',
            value: data.admins,
            icon: 'bi bi-shield-lock',
            gradient: 'linear-gradient(135deg,#fd7e14,#dc3545)',
            action: 'usuarios',
          },
          //  NUEVAS TARJETAS
          {
            label: 'Solicitudes Pendientes',
            value: data.solicitudesPendientes,
            icon: 'bi bi-hourglass-split',
            gradient: 'linear-gradient(135deg,#ffc107,#ff9800)',
            action: 'solicitudesPendientes',
          },
          {
            label: 'Servicios Aceptados',
            value: data.serviciosAceptados,
            icon: 'bi bi-check2-circle',
            gradient: 'linear-gradient(135deg,#28a745,#009688)',
            action: 'serviciosAceptados',
          },
          {
            label: 'Pagos Procesados',
            value: data.pagosProcesados, //  Aquí!
            icon: 'bi bi-cash-coin',
            gradient: 'linear-gradient(135deg,#17a2b8,#0d6efd)',
            action: 'pagosProcesados',
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
  onCardClick(action: string): void {
    this.mostrarDetalle = true;

    switch (action) {
      case 'pacientes':
        this.tituloDetalle = 'Pacientes';
        this.listaDetalle = this.usuarios.filter((u) => u.rol === 'PACIENTE');
        this.tabActiva = 'usuarios';
        break;

      case 'prestadores':
        this.tituloDetalle = 'Prestadores';
        this.listaDetalle = this.usuarios.filter((u) => u.rol === 'PRESTADOR');
        this.tabActiva = 'usuarios';
        break;

      case 'transportistas':
        this.tituloDetalle = 'Transportistas';
        this.listaDetalle = this.usuarios.filter((u) => u.rol === 'TRANSPORTISTA');
        this.tabActiva = 'usuarios';
        break;

      case 'solicitudesPendientes':
        this.tituloDetalle = 'Solicitudes Pendientes';
        this.adminService
          .getServicesByEstado('PENDIENTE')
          .subscribe((data) => (this.listaDetalle = data));
        this.tabActiva = 'estadisticas';
        break;

      case 'serviciosAceptados':
        this.tituloDetalle = 'Servicios Aceptados';
        this.adminService
          .getServicesByEstado('ACEPTADO')
          .subscribe((data) => (this.listaDetalle = data));
        this.tabActiva = 'estadisticas';
        break;

      case 'pagosProcesados':
        this.tituloDetalle = 'Pagos Procesados';
        this.adminService.getPagos().subscribe((data) => (this.listaDetalle = data));
        this.tabActiva = 'montos';
        break;
    }
  }

  //  CERRAR SESIÓN
  logout(): void {
    this.authService.logout();
  }
}
