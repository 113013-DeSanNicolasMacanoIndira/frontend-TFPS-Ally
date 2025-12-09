import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from './../../services/admin.service';
import { AdminMetrics, AdminUser } from './../../models/admin.model';
import { AuthService } from './../../services/auth.service';
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
  tabActiva: string = 'dashboard';
  fechaDesde: string = '';
  fechaHasta: string = '';
  solicitudes: any[] = [];
  tituloSolicitudes: string = '';
  solicitudSeleccionada: any = null;

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
  }

  abrirDetalle(s: any) {
    this.solicitudSeleccionada = s;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('detalleModal'));
    modal.show();
  }

  cambiarEstado(nuevoEstado: string) {
    const id = this.solicitudSeleccionada[0];

    this.adminService.actualizarEstadoServicio(id, nuevoEstado).subscribe({
      next: () => {
        this.solicitudSeleccionada[4] = nuevoEstado;
        this.loadMetrics();
        this.onCardClick(
          nuevoEstado === 'ACEPTADO' ? 'serviciosAceptados' : 'solicitudesPendientes'
        );

        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          timer: 1400,
          showConfirmButton: false,
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
      },
    });
  }

  loadMetrics(): void {
    this.adminService.getMetrics(this.fechaDesde, this.fechaHasta).subscribe((data: AdminMetrics) => {
      this.metricCards = [
        { label: 'Pacientes', value: data.pacientes, icon: 'bi bi-people', gradient: 'linear-gradient(135deg,#007bff,#0dcaf0)', action: 'pacientes' },
        { label: 'Prestadores', value: data.prestadores, icon: 'bi bi-person-badge', gradient: 'linear-gradient(135deg,#6610f2,#6f42c1)', action: 'prestadores' },
        { label: 'Transportistas', value: data.transportistas, icon: 'bi bi-truck', gradient: 'linear-gradient(135deg,#20c997,#198754)', action: 'transportistas' },
        { label: 'Admins Activos', value: data.admins, icon: 'bi bi-shield-lock', gradient: 'linear-gradient(135deg,#fd7e14,#dc3545)', action: 'usuarios' },
        { label: 'Solicitudes Pendientes', value: data.solicitudesPendientes, icon: 'bi bi-hourglass-split', gradient: 'linear-gradient(135deg,#ffc107,#ff9800)', action: 'solicitudesPendientes' },
        { label: 'Servicios Aceptados', value: data.serviciosAceptados, icon: 'bi bi-check2-circle', gradient: 'linear-gradient(135deg,#28a745,#009688)', action: 'serviciosAceptados' },
        { label: 'Pagos Procesados', value: data.pagosProcesados, icon: 'bi bi-cash-coin', gradient: 'linear-gradient(135deg,#17a2b8,#0d6efd)', action: 'pagosProcesados' },
      ];
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe((data: AdminUser[]) => {
      this.usuarios = data;
    });
  }

  toggleEstado(u: AdminUser) {
    this.adminService.toggleUser(u.id).subscribe({
      next: (updated) => {
        u.activo = updated.activo;
        Swal.fire({
          icon: updated.activo ? 'success' : 'warning',
          title: updated.activo ? 'Usuario Activado' : 'Usuario Bloqueado',
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
  if (action === 'solicitudesPendientes') {
    this.tituloSolicitudes = 'Solicitudes Pendientes';
    this.adminService.getSolicitudesPendientes().subscribe((data: any[]) => {
      this.solicitudes = data.map((s: any) => {
        s[5] = new Date(s[5]);
        return s;
      });
      this.tabActiva = 'solicitudes';
    });
  }

  if (action === 'serviciosAceptados') {
    this.tituloSolicitudes = 'Servicios Aceptados';
    this.adminService.getServiciosAceptados().subscribe((data: any[]) => {
      this.solicitudes = data.map((s: any) => {
        s[5] = new Date(s[5]);
        return s;
      });
      this.tabActiva = 'solicitudes';
    });
  }
}

  logout(): void {
    this.authService.logout();
  }
}
