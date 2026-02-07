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
  // NUEVO: período
  periodo: 'HOY' | 'SEMANA' | 'MES' | 'PERSONALIZADO' = 'MES';
  solicitudSeleccionada: any = null;
  // ✅ SOLICITUDES: modo y filtros
  modoSolicitudes: 'PENDIENTES' | 'ACEPTADOS' = 'PENDIENTES';

  periodoSolicitudes: 'HOY' | 'SEMANA' | 'MES' | 'PERSONALIZADO' = 'MES';
  fechaDesdeSolicitudes: string = '';
  fechaHastaSolicitudes: string = '';

  searchSolicitudes: string = '';
  solicitudesFiltradas: any[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.onPeriodoChange();
    this.loadUsers();
  }
  // NUEVO
  onPeriodoChange() {
    const hoy = new Date();
    const format = (d: Date) => d.toISOString().slice(0, 10);

    if (this.periodo === 'HOY') {
      this.fechaDesde = format(hoy);
      this.fechaHasta = format(hoy);
      this.loadMetrics();
    }

    if (this.periodo === 'SEMANA') {
      const desde = new Date(hoy);
      desde.setDate(hoy.getDate() - 7);
      this.fechaDesde = format(desde);
      this.fechaHasta = format(hoy);
      this.loadMetrics();
    }

    if (this.periodo === 'MES') {
      const desde = new Date(hoy);
      desde.setDate(hoy.getDate() - 30);
      this.fechaDesde = format(desde);
      this.fechaHasta = format(hoy);
      this.loadMetrics();
    }

    if (this.periodo === 'PERSONALIZADO') {
      // no autofiltra
      // dejás que el usuario elija fechas y toque "Filtrar"
    }
  }
  private formatDate(d: Date) {
    return d.toISOString().slice(0, 10);
  }
  // ✅ Para poder usarlo en el template sin error
  isArr = Array.isArray;

  // ✅ Convierte lo que venga (string / Date / array LocalDateTime) a Date real
  toDate(value: any): Date | null {
    if (!value) return null;

    // ya es Date
    if (value instanceof Date) return value;

    // LocalDateTime como array: [yyyy, mm, dd, hh, mm, ss, nano]
    if (Array.isArray(value)) {
      const [y, mo, d, h = 0, mi = 0, s = 0] = value;
      return new Date(y, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, s ?? 0);
    }

    // String ISO: "2026-02-04T00:44:07..."
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // ✅ Devuelve la fecha de una fila (array u objeto)
  getFechaSolicitud(item: any): Date | null {
    if (!item) return null;
    return this.isArr(item) ? this.toDate(item[5]) : this.toDate(item.fechaSolicitud);
  }

  onPeriodoSolicitudesChange() {
    const hoy = new Date();

    if (this.periodoSolicitudes === 'HOY') {
      this.fechaDesdeSolicitudes = this.formatDate(hoy);
      this.fechaHastaSolicitudes = this.formatDate(hoy);
      this.loadSolicitudesActuales();
    }

    if (this.periodoSolicitudes === 'SEMANA') {
      const desde = new Date(hoy);
      desde.setDate(hoy.getDate() - 7);
      this.fechaDesdeSolicitudes = this.formatDate(desde);
      this.fechaHastaSolicitudes = this.formatDate(hoy);
      this.loadSolicitudesActuales();
    }

    if (this.periodoSolicitudes === 'MES') {
      const desde = new Date(hoy);
      desde.setDate(hoy.getDate() - 30);
      this.fechaDesdeSolicitudes = this.formatDate(desde);
      this.fechaHastaSolicitudes = this.formatDate(hoy);
      this.loadSolicitudesActuales();
    }

    if (this.periodoSolicitudes === 'PERSONALIZADO') {
      // se aplica con botón "Aplicar"
    }
  }

  loadSolicitudesActuales() {
    const cargar =
      this.modoSolicitudes === 'PENDIENTES'
        ? this.adminService.getSolicitudesPendientes()
        : this.adminService.getServiciosAceptados();

    cargar.subscribe((data: any[]) => {
      this.solicitudes = data.map((s: any) => {
        s[5] = this.toDate(s[5]);
        return s;
      });

      // ✅ si no hay fechas seteadas, NO filtres, mostrálas todas
      if (!this.fechaDesdeSolicitudes && !this.fechaHastaSolicitudes) {
        this.solicitudesFiltradas = [...this.solicitudes];
        return;
      }

      this.aplicarFiltroLocal();
    });
  }

  aplicarFiltroLocal() {
    const desde = this.fechaDesdeSolicitudes ? new Date(this.fechaDesdeSolicitudes) : null;
    const hasta = this.fechaHastaSolicitudes ? new Date(this.fechaHastaSolicitudes) : null;

    if (hasta) hasta.setHours(23, 59, 59, 999);

    const q = (this.searchSolicitudes || '').toLowerCase().trim();

    this.solicitudesFiltradas = this.solicitudes.filter((s: any) => {
      const fecha = s[5] instanceof Date ? s[5] : new Date(s[5]);
      const okFecha = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);

      const texto = `${s[1] ?? ''} ${s[2] ?? ''} ${s[3] ?? ''} ${s[4] ?? ''}`.toLowerCase();
      const okTexto = !q || texto.includes(q);

      return okFecha && okTexto;
    });
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
          nuevoEstado === 'ACEPTADO' ? 'serviciosAceptados' : 'solicitudesPendientes',
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
            value: data.pagosProcesados,
            icon: 'bi bi-cash-coin',
            gradient: 'linear-gradient(135deg,#17a2b8,#0d6efd)',
            action: 'pagosProcesados',
          },
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
      this.modoSolicitudes = 'PENDIENTES';
      this.tituloSolicitudes = 'Solicitudes Pendientes';
      this.tabActiva = 'solicitudes';

      // ✅ fuerza período y setea fechas antes de cargar
      this.periodoSolicitudes = 'MES';
      this.onPeriodoSolicitudesChange();
    }

    if (action === 'serviciosAceptados') {
      this.modoSolicitudes = 'ACEPTADOS';
      this.tituloSolicitudes = 'Servicios Aceptados';
      this.tabActiva = 'solicitudes';

      // ✅ fuerza período y setea fechas antes de cargar
      this.periodoSolicitudes = 'MES';
      this.onPeriodoSolicitudesChange();
    }
  }
  abrirSolicitudesTodas(): void {
    this.tabActiva = 'solicitudes';
    this.tituloSolicitudes = 'Todas las Solicitudes';
    this.modoSolicitudes = 'PENDIENTES'; // da igual, ya no se usa acá

    // seteo período por defecto y fechas
    this.periodoSolicitudes = 'MES';
    this.onPeriodoSolicitudesChange();

    // cargar TODO (pendientes + aceptados)
    this.loadSolicitudesTodas();
  }
  loadSolicitudesTodas(): void {
    this.adminService.getSolicitudesPendientes().subscribe((pendientes: any[]) => {
      this.adminService.getServiciosAceptados().subscribe((aceptados: any[]) => {
        console.log('pendientes[0]=', pendientes[0]);
        console.log('aceptados[0]=', aceptados[0]);

        const normalizar = (data: any[]) =>
          data.map((s: any) => {
            // ✅ si es array:
            if (Array.isArray(s)) {
              s[5] = this.toDate(s[5]); // ✅ ahora soporta array LocalDateTime
              return s;
            }

            s.fechaSolicitud = this.toDate(s.fechaSolicitud);
            return s;
          });

        this.solicitudes = [...normalizar(pendientes), ...normalizar(aceptados)];

        this.solicitudes.sort((a: any, b: any) => {
          const fa = Array.isArray(a)
            ? a[5]
              ? +new Date(a[5])
              : 0
            : a.fechaSolicitud
              ? +new Date(a.fechaSolicitud)
              : 0;
          const fb = Array.isArray(b)
            ? b[5]
              ? +new Date(b[5])
              : 0
            : b.fechaSolicitud
              ? +new Date(b.fechaSolicitud)
              : 0;
          return fb - fa;
        });
      });
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
