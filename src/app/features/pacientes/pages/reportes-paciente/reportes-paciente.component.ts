import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration, TooltipItem } from 'chart.js';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { PatientReportsService, ReportResumenDTO, SerieDTO } from '../../../../services/patient-reports.service';
import { MenuPacienteComponent } from '../../../../components/menu-paciente/menu-paciente.component';
import { ServiceRequestService, ServiceDTO } from '../../../../services/service-request.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reportes-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    MenuPacienteComponent,
  ],
  templateUrl: './reportes-paciente.component.html',
  styleUrls: ['./reportes-paciente.component.scss']
})
export class ReportesPacienteComponent implements OnInit {
  // Variables de estado
  tabActiva: 'resumen' | 'solicitudes' | 'graficos' = 'resumen';
  cargandoTabla = false;
  cargandoGraficos = false;

  // Datos de resumen
  resumen?: ReportResumenDTO;
  usuarioId: number = 0;

  // Datos para gráficos
  especialidadesChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
        '#6A0572', '#AB83A1', '#118AB2', '#06D6A0'
      ],
      hoverBackgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
        '#6A0572', '#AB83A1', '#118AB2', '#06D6A0'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  estadosChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#4BC0C0', // Aceptados
        '#FFCE56', // Pendientes
        '#FF6384', // Rechazados
        '#36A2EB', // Confirmados
        '#9966FF', // Completados
        '#FF9F40', // Cancelados
        '#8AC926'  // Solicitados
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  pagosChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Pagos (ARS)',
      borderColor: '#4BC0C0',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#4BC0C0',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  // Opciones para gráficos
  donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  pieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const yValue = context.parsed.y;
            if (yValue !== null && yValue !== undefined) {
              return `${context.dataset.label}: $${yValue.toLocaleString('es-AR')}`;
            }
            return `${context.dataset.label}: $0`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            const numValue = typeof value === 'number' ? value : parseFloat(value as string);
            return '$' + numValue.toLocaleString('es-AR');
          },
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Datos para tabla de solicitudes
  solicitudes: ServiceDTO[] = [];
  solicitudesFiltradas: ServiceDTO[] = [];
  solicitudesPaginadas: ServiceDTO[] = [];

  // Filtros
  fDesde: string = '';
  fHasta: string = '';
  fEspecialidad: string = '';
  fEstado: string = '';
  fBusqueda: string = '';
  especialidadesDisponibles: string[] = [];

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  constructor(
    private reportsService: PatientReportsService,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener ID del paciente desde el auth service
    const user = this.authService.getUser();
    if (user && user.id) {
      this.usuarioId = user.id;
      this.cargarReportes();
    } else {
      console.error('No se pudo obtener el usuario logueado');
      Swal.fire('Error', 'No hay usuario autenticado', 'error');
      this.router.navigate(['/login']);
    }
  }

  cambiarTab(tab: 'resumen' | 'solicitudes' | 'graficos') {
    this.tabActiva = tab;

    // Si se cambia a gráficos y no están cargados, cargarlos
    if (tab === 'graficos' && !this.especialidadesChartData.datasets[0].data.length) {
      this.cargarReportes();
    }
  }

  // ========== SECCIÓN REPORTES Y GRÁFICOS ==========
  cargarReportes() {
    if (!this.usuarioId) {
      console.error('usuarioId no válido');
      return;
    }

    this.cargandoGraficos = true;

    // Cargar resumen
    this.reportsService.resumen(this.usuarioId)
      .subscribe({
        next: (r) => {
          this.resumen = r;
          console.log('Resumen cargado:', r);
        },
        error: (err) => {
          console.error('Error cargando resumen:', err);
          Swal.fire('Error', 'No se pudo cargar el resumen', 'error');
        }
      });

    // Cargar datos para gráficos
    this.reportsService.porEspecialidad(this.usuarioId)
      .subscribe({
        next: (r) => {
          console.log('Datos por especialidad:', r);
          this.especialidadesChartData = {
            labels: r.map(x => x.label),
            datasets: [{
              data: r.map(x => x.value),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
                '#6A0572', '#AB83A1', '#118AB2', '#06D6A0'
              ],
              hoverBackgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
                '#6A0572', '#AB83A1', '#118AB2', '#06D6A0'
              ],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          };
          this.cargandoGraficos = false;
        },
        error: (err) => {
          console.error('Error cargando datos por especialidad:', err);
          // Datos de ejemplo para desarrollo
          this.especialidadesChartData = {
            labels: ['Medicina General', 'Pediatría', 'Cardiología', 'Dermatología'],
            datasets: [{
              data: [12, 8, 5, 3],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          };
          this.cargandoGraficos = false;
        }
      });

    this.reportsService.porEstado(this.usuarioId)
      .subscribe({
        next: (r) => {
          console.log('Datos por estado:', r);
          this.estadosChartData = {
            labels: r.map(x => this.getEstadoLabelChart(x.label)),
            datasets: [{
              data: r.map(x => x.value),
              backgroundColor: [
                '#4BC0C0', // Aceptados
                '#FFCE56', // Pendientes
                '#FF6384', // Rechazados
                '#36A2EB', // Confirmados
                '#9966FF', // Completados
                '#FF9F40', // Cancelados
                '#8AC926'  // Solicitados
              ],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          };
        },
        error: (err) => {
          console.error('Error cargando datos por estado:', err);
          // Datos de ejemplo para desarrollo
          this.estadosChartData = {
            labels: ['Aceptadas', 'Pendientes', 'Rechazadas'],
            datasets: [{
              data: [15, 8, 3],
              backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384'],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          };
        }
      });

    this.reportsService.pagosPorMes(this.usuarioId)
      .subscribe({
        next: (r) => {
          console.log('Datos de pagos por mes:', r);
          this.pagosChartData = {
            labels: r.map(x => x.label),
            datasets: [{
              data: r.map(x => x.value),
              label: 'Pagos (ARS)',
              borderColor: '#4BC0C0',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#4BC0C0',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          };
        },
        error: (err) => {
          console.error('Error cargando pagos por mes:', err);
          // Datos de ejemplo para desarrollo
          const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
          this.pagosChartData = {
            labels: meses,
            datasets: [{
              data: [12000, 19000, 8000, 15000, 22000, 17000],
              label: 'Pagos (ARS)',
              borderColor: '#4BC0C0',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4
            }]
          };
        }
      });
  }

  // ========== SECCIÓN TABLA DE SOLICITUDES ==========
  cargarSolicitudes() {
    this.tabActiva = 'solicitudes';

    if (!this.usuarioId) return;

    this.cargandoTabla = true;

    // Llamada al servicio que obtiene las solicitudes del paciente
    this.serviceRequestService.getSolicitudesPaciente(this.usuarioId)
      .subscribe({
        next: (data) => {
          this.solicitudes = data;
          this.solicitudesFiltradas = [...data];

          // Extraer especialidades únicas para el filtro
          this.buildEspecialidadesDisponibles();

          // Aplicar paginación inicial
          this.aplicarFiltroLocal();
          this.cargandoTabla = false;
        },
        error: (error) => {
          console.error('Error cargando solicitudes:', error);
          Swal.fire('Error', 'No se pudieron cargar las solicitudes', 'error');
          this.cargandoTabla = false;
        }
      });
  }

  // Construir lista de especialidades únicas
  private buildEspecialidadesDisponibles() {
    const set = new Set<string>();
    for (const s of this.solicitudes) {
      const esp = (s.especialidad || '').trim();
      if (esp) set.add(esp);
    }
    this.especialidadesDisponibles = Array.from(set).sort();
  }

  // Aplicar filtros localmente
  aplicarFiltroLocal() {
    this.paginaActual = 1;

    let filtradas = [...this.solicitudes];

    // Filtrar por fechas
    if (this.fDesde) {
      const desde = new Date(this.fDesde);
      desde.setHours(0, 0, 0, 0);
      filtradas = filtradas.filter(s => {
        const fechaSolicitud = s.fechaSolicitud ? new Date(s.fechaSolicitud) : null;
        return fechaSolicitud && fechaSolicitud >= desde;
      });
    }

    if (this.fHasta) {
      const hasta = new Date(this.fHasta);
      hasta.setHours(23, 59, 59, 999);
      filtradas = filtradas.filter(s => {
        const fechaSolicitud = s.fechaSolicitud ? new Date(s.fechaSolicitud) : null;
        return fechaSolicitud && fechaSolicitud <= hasta;
      });
    }

    // Filtrar por especialidad
    if (this.fEspecialidad) {
      filtradas = filtradas.filter(s => s.especialidad === this.fEspecialidad);
    }

    // Filtrar por estado
    if (this.fEstado) {
      filtradas = filtradas.filter(s => s.estado === this.fEstado);
    }

    // Filtrar por búsqueda de texto
    if (this.fBusqueda) {
      const busqueda = this.fBusqueda.toLowerCase().trim();
      filtradas = filtradas.filter(s => {
        const texto = `${s.descripcion || ''} ${s.especialidad || ''} ${s.prestadorNombre || ''} ${s.prestadorApellido || ''}`.toLowerCase();
        return texto.includes(busqueda);
      });
    }

    this.solicitudesFiltradas = filtradas;
    this.actualizarPaginacion();
  }

  // Limpiar todos los filtros
  limpiarFiltros() {
    this.fDesde = '';
    this.fHasta = '';
    this.fEspecialidad = '';
    this.fEstado = '';
    this.fBusqueda = '';
    this.aplicarFiltroLocal();
  }

  // ========== PAGINACIÓN ==========
  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.solicitudesFiltradas.length / this.itemsPorPagina);
    const startIndex = (this.paginaActual - 1) * this.itemsPorPagina;
    const endIndex = startIndex + this.itemsPorPagina;
    this.solicitudesPaginadas = this.solicitudesFiltradas.slice(startIndex, endIndex);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarPaginacion();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPaginacion();
    }
  }

  // ========== ACCIONES ==========
  verDetalle(solicitud: ServiceDTO) {
    Swal.fire({
      title: 'Detalle de la Solicitud',
      html: `
        <div class="text-start">
          <p><strong>ID:</strong> ${solicitud.id}</p>
          <p><strong>Especialidad:</strong> ${solicitud.especialidad}</p>
          <p><strong>Estado:</strong> ${this.getEstadoLabel(solicitud.estado)}</p>
          <p><strong>Fecha:</strong> ${solicitud.fechaSolicitud ? (new Date(solicitud.fechaSolicitud).toLocaleString('es-AR')) : 'N/A'}</p>
          <p><strong>Descripción:</strong> ${solicitud.descripcion || 'Sin descripción'}</p>
          ${solicitud.prestadorNombre ? `<p><strong>Prestador:</strong> ${solicitud.prestadorNombre} ${solicitud.prestadorApellido || ''}</p>` : ''}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      width: '600px'
    });
  }

  cancelarSolicitud(id: number) {
    Swal.fire({
      title: '¿Cancelar solicitud?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceRequestService.cancelarSolicitud(id).subscribe({
          next: () => {
            Swal.fire('Cancelada', 'La solicitud ha sido cancelada', 'success');
            // Recargar la lista
            this.cargarSolicitudes();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo cancelar la solicitud', 'error');
          }
        });
      }
    });
  }

  // ========== UTILIDADES ==========
  getEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'SOLICITADO': 'Solicitado',
      'PENDIENTE': 'Pendiente',
      'ACEPTADO': 'Aceptado',
      'CONFIRMADO': 'Confirmado',
      'RECHAZADO': 'Rechazado',
      'CANCELADO': 'Cancelado',
      'COMPLETADO': 'Completado'
    };
    return estados[estado] || estado;
  }

  getEstadoLabelChart(estado: string): string {
    const estados: { [key: string]: string } = {
      'ACEPTADO': 'Aceptadas',
      'PENDIENTE': 'Pendientes',
      'RECHAZADO': 'Rechazadas',
      'CONFIRMADO': 'Confirmadas',
      'COMPLETADO': 'Completadas',
      'CANCELADO': 'Canceladas',
      'SOLICITADO': 'Solicitadas'
    };
    return estados[estado] || estado;
  }

  getDescripcionTruncada(descripcion: string | null | undefined): string {
    if (!descripcion) return '';
    if (descripcion.length <= 50) return descripcion;
    return descripcion.substring(0, 50) + '...';
  }

  // ========== MÉTODOS PARA GRÁFICOS ==========
  getTotalEspecialidades(): number {
    const data = this.especialidadesChartData.datasets[0].data;
    if (!data || data.length === 0) return 0;

    // Filtrar solo valores numéricos y sumarlos
    const numericData = data.filter((val): val is number => typeof val === 'number');
    return numericData.reduce((a, b) => a + b, 0);
  }

  getTotalPagos(): number {
    const data = this.pagosChartData.datasets[0].data;
    if (!data || data.length === 0) return 0;

    // Filtrar solo valores numéricos y sumarlos
    const numericData = data.filter((val): val is number => typeof val === 'number');
    return numericData.reduce((a, b) => a + b, 0);
  }

  // Método para verificar si hay datos en gráficos
  hayDatosEnGraficos(): boolean {
    const especialidadesData = this.especialidadesChartData.datasets[0].data;
    const estadosData = this.estadosChartData.datasets[0].data;
    const pagosData = this.pagosChartData.datasets[0].data;

    const hayEspecialidades = especialidadesData &&
      especialidadesData.length > 0 &&
      especialidadesData.some(val => typeof val === 'number' && val > 0);

    const hayEstados = estadosData &&
      estadosData.length > 0 &&
      estadosData.some(val => typeof val === 'number' && val > 0);

    const hayPagos = pagosData &&
      pagosData.length > 0 &&
      pagosData.some(val => typeof val === 'number' && val > 0);

    return hayEspecialidades || hayEstados || hayPagos;
  }
}
