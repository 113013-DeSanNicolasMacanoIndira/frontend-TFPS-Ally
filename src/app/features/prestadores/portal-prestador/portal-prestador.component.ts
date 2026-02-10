import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { ServiceRequestService } from '../../../services/service-request.service';
import { AuthService } from '../../../services/auth.service';
import { ProviderService } from '../../../services/provider.service';
import { SpecialtyService } from '../../../services/specialty.service';
import { ProviderReportsService } from '../../../services/provider-reports.service';

import { Provider } from '../../../models/provider.model';
import { ProviderReports } from '../../../models/provider-reports.model';

import { CbuFormatPipe } from '../../../cbu-format-pipe';

// ✅ TU VERSION: usa NgChartsModule (no ChartsModule)
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartConfiguration } from 'chart.js';


@Component({
  selector: 'app-portal-prestador',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BaseChartDirective,    // ✅
    CbuFormatPipe
  ],
  templateUrl: './portal-prestador.component.html',
  styleUrls: ['./portal-prestador.component.scss']
})
export class PortalPrestadorComponent implements OnInit {


  // Variables generales
  username = '';
  seccionActiva = 'perfil';
  loading = false;
  loadingEspecialidades = false;

  // Datos del prestador
  prestador: Provider | null = null;
  modoEdicion = false;
  esNuevoPrestador = true;

  // Solicitudes
  solicitudesRecibidas: any[] = [];
  solicitudesConfirmadas: any[] = [];

  // Especialidades
  especialidades: any[] = [];
  especialidadNombreMostrar = '';

  // Formulario Reactivo
  prestadorForm: FormGroup;

  mostrarFaq = false;
  solicitudes: any[] = [];
  cargando = true;

  // Fecha máxima para fecha de nacimiento (no puede ser futura)
  maxDate: string;

  // ========== PROPIEDADES PARA REPORTES ==========
  filtroPeriodo: '6M' | '12M' | 'ALL' = '6M';
  loadingReportes = false;
  reportes: ProviderReports | null = null;

  // Propiedades para gráficos
  chartEspecialidadesData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  chartEstadosData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  chartIngresosData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  // Opciones de gráficos
  chartDonutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  chartPieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  chartLineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { maxRotation: 0 } },
      y: { beginAtZero: true }
    }
  };

  // ========== PROPIEDADES PARA LA TABLA ADMIN ==========
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroEstado: string = '';
  filtroBusqueda: string = '';
  cargandoTablaAdmin = false;
  solicitudesTablaAdmin: any[] = [];
  solicitudesTablaAdminFiltradas: any[] = [];
  solicitudesPaginadas: any[] = [];
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  constructor(
    private fb: FormBuilder,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService,
    private providerService: ProviderService,
    private specialtyService: SpecialtyService,
    private providerReportsService: ProviderReportsService,
    private router: Router
  ) {

    // Configurar fecha máxima para fecha de nacimiento
    // Fecha actual para validación
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    // Inicializar formulario reactivo (igual que en registrar-paciente)
    this.prestadorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      especialidadId: ['', Validators.required],
      matricula: [''],
      coberturaObraSocial: [false],
      // NUEVOS CAMPOS
      fechaNacimiento: ['', [Validators.required, this.maxDateValidator.bind(this)]],
      telegram: [''],
      cbuBancaria: ['', [Validators.required, Validators.pattern(/^\d{22}$/)]]
    });
  }

  ngOnInit() {
    const user = this.authService.getUser();

    if (!user || !user.id) {
      console.error("⚠ No hay usuario logueado o falta el ID");
      this.router.navigate(['/login']);
      return;
    }

    this.username = user.username ?? '';
    this.cargarEspecialidades();
    this.verificarPrestadorRegistrado(user.id);
  }

  // Validador personalizado para fecha máxima (no futura)
  private maxDateValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();

    // Limpiar horas para comparar solo fechas
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? { maxDate: true } : null;
  }

  // Cargar especialidades desde el endpoint
  cargarEspecialidades() {
    this.loadingEspecialidades = true;
    this.specialtyService.getAll().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
        this.loadingEspecialidades = false;
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
        this.loadingEspecialidades = false;
        // Especialidades de ejemplo para desarrollo
        this.especialidades = [
          { id: 1, codigo: 'MED_GEN', nombre: 'Medicina General' },
          { id: 2, codigo: 'PED', nombre: 'Pediatría' },
          { id: 3, codigo: 'CARD', nombre: 'Cardiología' },
          { id: 4, codigo: 'DERM', nombre: 'Dermatología' },
          { id: 5, codigo: 'OFT', nombre: 'Oftalmología' },
          { id: 6, codigo: 'KINESIOLOGIA', nombre: 'Kinesiología' },
          { id: 7, codigo: 'PSICOLOGIA', nombre: 'Psicología' },
          { id: 8, codigo: 'FONOAUDIOLOGIA', nombre: 'Fonoaudiología' },
          { id: 9, codigo: 'TERAPIA_OCUPACIONAL', nombre: 'Terapia Ocupacional' },
          { id: 10, codigo: 'ASISTENTE_TERAPEUTICO', nombre: 'Asistente Terapéutico' },
          { id: 11, codigo: 'TRANSPORTE_SANITARIO', nombre: 'Transporte Sanitario' }
        ];
        Swal.fire('Información', 'Se cargaron especialidades de ejemplo', 'info');
      }
    });
  }

  // Cuando se selecciona una especialidad del combo
  onEspecialidadChange() {
    const especialidadSeleccionada = this.especialidades.find(
      esp => esp.id == this.prestadorForm.get('especialidadId')?.value
    );

    if (especialidadSeleccionada) {
      this.especialidadNombreMostrar = especialidadSeleccionada.nombre;
    }
  }

  // Verificar si el usuario ya está registrado como prestador
  verificarPrestadorRegistrado(usuarioId: number) {
    this.loading = true;

    this.providerService.getByUsuarioId(usuarioId).subscribe({
      next: (prestador) => {
        this.prestador = prestador;
        this.patchFormValues(prestador);
        this.esNuevoPrestador = false;
        this.loading = false;

        // Obtener el nombre de la especialidad para mostrar
        if (prestador.codigoEspecialidad) {
          const especialidad = this.especialidades.find(esp => esp.codigo === prestador.codigoEspecialidad);
          this.especialidadNombreMostrar = especialidad ? especialidad.nombre : prestador.codigoEspecialidad;
        }

        // Cargar solicitudes si ya está registrado
        this.cargarSolicitudesRecibidas();
        this.cargarSolicitudesConfirmadas();

        // Cargar reportes si el prestador existe
        if (prestador.id) {
          this.cargarTablaAdmin();
        }
      },
      error: (error) => {
        // Si no existe el prestador, mostrar formulario de registro
        this.esNuevoPrestador = true;
        this.loading = false;
      }
    });
  }

  // Llenar el formulario con los datos del prestador (para edición)
  private patchFormValues(prestador: Provider) {
    // Encontrar el ID de la especialidad basado en el código
    const especialidad = this.especialidades.find(esp => esp.codigo === prestador.codigoEspecialidad);

    // Formatear fecha para input type="date"
    let fechaNacimientoFormatted = '';
    if (prestador.fechaNacimiento) {
      const fecha = new Date(prestador.fechaNacimiento);
      fechaNacimientoFormatted = fecha.toISOString().split('T')[0];
    }

    this.prestadorForm.patchValue({
      nombre: prestador.nombre,
      apellido: prestador.apellido,
      email: prestador.email,
      telefono: prestador.telefono,
      direccion: prestador.direccion,
      especialidadId: especialidad?.id || '',
      matricula: prestador.matricula || '',
      coberturaObraSocial: prestador.coberturaObraSocial || false,
      // NUEVOS CAMPOS
      fechaNacimiento: fechaNacimientoFormatted,
      telegram: prestador.telegram || '',
      cbuBancaria: prestador.cbuBancaria || ''
    });

    this.especialidadNombreMostrar = especialidad?.nombre || prestador.codigoEspecialidad;
  }

  // Cambiar sección
  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;

    if (seccion === 'solicitudes') {
      this.cargarSolicitudesRecibidas();
    } else if (seccion === 'confirmadas') {
      this.cargarSolicitudesConfirmadas();
    } else if (seccion === 'reportes') {
      this.cargarReportes();
    }
  }

  // Formatear CBU mientras se escribe
  formatearCBU(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Solo números

    // Limitar a 22 dígitos
    if (value.length > 22) {
      value = value.substring(0, 22);
    }

    // Formato visual: 0000-0000-0000-0000-0000
    if (value.length > 0) {
      const formatted = value.match(/.{1,4}/g)?.join('-') || value;
      event.target.value = formatted;
    }

    // Actualizar el form control con solo números
    this.prestadorForm.get('cbuBancaria')?.setValue(value, { emitEvent: false });
  }

  // Mostrar información sobre CBU
  mostrarInfoCBU(): void {
    Swal.fire({
      title: '¿Qué es la CBU?',
      html: `
        <div class="text-start">
          <p><strong>CBU (Clave Bancaria Uniforme)</strong> es un código de 22 dígitos que identifica tu cuenta bancaria.</p>
          <p><strong>¿Dónde la encuentro?</strong></p>
          <ul>
            <li>En tu home banking</li>
            <li>En el resumen de cuenta</li>
            <li>En la app de tu banco</li>
            <li>Formato: 0720-3211-8800-0034-5678-90</li>
          </ul>
          <p class="text-danger"><strong>Importante:</strong> Solo ingresá números, sin espacios ni guiones.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  }

  // Información sobre Telegram
  abrirTelegramInfo(): void {
    Swal.fire({
      title: '¿Por qué Telegram?',
      html: `
        <div class="text-start">
          <p>Telegram nos permite:</p>
          <ul>
            <li>Comunicación directa con pacientes</li>
            <li>Envío de recordatorios de turnos</li>
            <li>Compartir documentos e información</li>
            <li>Mensajes cifrados y seguros</li>
          </ul>
          <p><strong>Ejemplo:</strong> Si tu usuario es @dr_roberto, solo ingresá: <code>dr_roberto</code></p>
          <p class="text-muted"><small>Este campo es opcional pero recomendado.</small></p>
        </div>
      `,
      icon: 'question',
      confirmButtonText: 'Entendido'
    });
  }

  // SECCIÓN PERFIL - Registrar prestador
  registrarPrestador() {
    if (this.prestadorForm.invalid) {
      Swal.fire('Atención', 'Completá todos los campos requeridos.', 'warning');
      this.prestadorForm.markAllAsTouched();
      return;
    }

    const loggedUser = this.authService.getUser();
    if (!loggedUser) {
      Swal.fire('Error', 'No hay usuario logueado. Iniciá sesión nuevamente.', 'error');
      return;
    }

    this.loading = true;
    const formValue = this.prestadorForm.value;

    // Encontrar la especialidad seleccionada para obtener su código
    const especialidadSeleccionada = this.especialidades.find(
      esp => esp.id == formValue.especialidadId
    );

    if (!especialidadSeleccionada) {
      Swal.fire('Error', 'Debe seleccionar una especialidad válida', 'error');
      this.loading = false;
      return;
    }

    // Preparar payload igual que en registrar-paciente
    const payload: Provider = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      email: formValue.email,
      telefono: formValue.telefono,
      direccion: formValue.direccion,
      codigoEspecialidad: especialidadSeleccionada.codigo, // Usar el código, no el ID
      activo: true,
      idUsuario: loggedUser.id,
      matricula: formValue.matricula || undefined,
      coberturaObraSocial: formValue.coberturaObraSocial || false,
      // NUEVOS CAMPOS
      fechaNacimiento: formValue.fechaNacimiento,
      telegram: formValue.telegram || undefined,
      cbuBancaria: formValue.cbuBancaria.replace(/\D/g, '') // Limpiar guiones
    };

    this.providerService.create(payload).subscribe({
      next: (prestadorCreado) => {
        this.prestador = prestadorCreado;
        this.esNuevoPrestador = false;
        this.loading = false;

        // Obtener el nombre de la especialidad para mostrar
        if (prestadorCreado.codigoEspecialidad) {
          const especialidad = this.especialidades.find(esp => esp.codigo === prestadorCreado.codigoEspecialidad);
          this.especialidadNombreMostrar = especialidad ? especialidad.nombre : prestadorCreado.codigoEspecialidad;
        }

        Swal.fire({
          title: 'Éxito',
          text: 'Prestador registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Continuar'
        });

        // Cargar solicitudes después del registro
        this.cargarSolicitudesRecibidas();
        this.cargarSolicitudesConfirmadas();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error registrando prestador:', error);
        Swal.fire('Error', 'No se pudo registrar el prestador.', 'error');
      }
    });
  }

  // SECCIÓN PERFIL - Actualizar prestador
  actualizarPrestador() {
    if (this.prestadorForm.invalid) {
      Swal.fire('Atención', 'Completá todos los campos requeridos.', 'warning');
      this.prestadorForm.markAllAsTouched();
      return;
    }

    if (!this.prestador?.id) return;

    this.loading = true;
    const formValue = this.prestadorForm.value;

    // Encontrar la especialidad seleccionada
    const especialidadSeleccionada = this.especialidades.find(
      esp => esp.id == formValue.especialidadId
    );

    if (!especialidadSeleccionada) {
      Swal.fire('Error', 'Debe seleccionar una especialidad válida', 'error');
      this.loading = false;
      return;
    }

    // Preparar payload para actualización
    const payload: Provider = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      email: formValue.email,
      telefono: formValue.telefono,
      direccion: formValue.direccion,
      codigoEspecialidad: especialidadSeleccionada.codigo,
      activo: this.prestador.activo,
      idUsuario: this.prestador.idUsuario,
      matricula: formValue.matricula || undefined,
      coberturaObraSocial: formValue.coberturaObraSocial || false,
      // NUEVOS CAMPOS
      fechaNacimiento: formValue.fechaNacimiento,
      telegram: formValue.telegram || undefined,
      cbuBancaria: formValue.cbuBancaria.replace(/\D/g, '') // Limpiar guiones

    };

    this.providerService.update(this.prestador.id, payload).subscribe({
      next: (prestadorActualizado) => {
        this.prestador = prestadorActualizado;
        this.modoEdicion = false;
        this.loading = false;

        // Obtener el nombre de la especialidad para mostrar
        if (prestadorActualizado.codigoEspecialidad) {
          const especialidad = this.especialidades.find(esp => esp.codigo === prestadorActualizado.codigoEspecialidad);
          this.especialidadNombreMostrar = especialidad ? especialidad.nombre : prestadorActualizado.codigoEspecialidad;
        }

        Swal.fire('Éxito', 'Datos actualizados correctamente', 'success');
      },
      error: (error) => {
        this.loading = false;
        Swal.fire('Error', 'No se pudieron actualizar los datos', 'error');
      }
    });
  }

  // SECCIÓN PERFIL - Baja lógica del prestador
  darDeBajaPrestador() {
    if (!this.prestador?.id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción dará de baja tu perfil de prestador. Podrás reactivarlo más tarde.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.providerService.darDeBaja(this.prestador!.id!).subscribe({
          next: (prestador) => {
            this.prestador = prestador;
            this.loading = false;
            this.solicitudesRecibidas = [];
            this.solicitudesConfirmadas = [];
            Swal.fire('Baja realizada', 'Tu perfil ha sido dado de baja', 'success');
          },
          error: (error) => {
            this.loading = false;
            Swal.fire('Error', 'No se pudo realizar la baja', 'error');
          }
        });
      }
    });
  }

  // SECCIÓN SOLICITUDES - Cargar solicitudes recibidas
  cargarSolicitudesRecibidas() {
    if (!this.prestador?.id) return;

    this.loading = true;
    this.serviceRequestService.getSolicitudesPrestador(this.prestador.id)
      .subscribe({
        next: (data) => {
          this.solicitudesRecibidas = data.filter((s: any) =>
            s.estado === 'PENDIENTE' || s.estado === 'SOLICITADO'
          );
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          Swal.fire('Error', 'No se pudieron cargar las solicitudes', 'error');
        }
      });
  }

  // SECCIÓN SOLICITUDES - Aceptar solicitud
  aceptarSolicitud(id: number) {
    this.serviceRequestService.aceptar(id).subscribe({
      next: () => {
        Swal.fire('Solicitud aceptada', 'La solicitud ha sido aceptada correctamente', 'success');
        this.cargarSolicitudesRecibidas();
        this.cargarSolicitudesConfirmadas();
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo aceptar la solicitud', 'error');
      }
    });
  }

  // SECCIÓN SOLICITUDES - Rechazar solicitud
  rechazarSolicitud(id: number) {
    Swal.fire({
      title: '¿Rechazar solicitud?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceRequestService.rechazar(id).subscribe({
          next: () => {
            Swal.fire('Solicitud rechazada', 'La solicitud ha sido rechazada', 'success');
            this.cargarSolicitudesRecibidas();
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo rechazar la solicitud', 'error');
          }
        });
      }
    });
  }

  // SECCIÓN CONFIRMADAS - Cargar solicitudes confirmadas
  cargarSolicitudesConfirmadas() {
    if (!this.prestador?.id) return;

    this.loading = true;
    this.serviceRequestService.getSolicitudesPrestador(this.prestador.id)
      .subscribe({
        next: (data) => {
          this.solicitudesConfirmadas = data.filter((s: any) =>
            s.estado === 'ACEPTADO' || s.estado === 'CONFIRMADO' || s.estado === 'APROBADO'
          );
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          Swal.fire('Error', 'No se pudieron cargar las solicitudes confirmadas', 'error');
        }
      });
  }

  // ========== SECCIÓN REPORTES ==========

  // Método para cargar reportes
  cargarReportes(): void {
    const user = this.authService.getUser();
    if (!user?.id) return;

    this.loadingReportes = true;

    // Cargar reportes y también la tabla
    this.cargarTablaAdmin(); // Esto cargará la tabla en paralelo

    if (this.prestador?.id) {
      this.getReportes(this.prestador.id);
    } else {
      // Si no tenemos el prestador, buscarlo primero
      this.providerService.getByUsuarioId(user.id).subscribe({
        next: (p) => {
          this.prestador = p;
          if (p.id) {
            this.getReportes(p.id);
          } else {
            this.loadingReportes = false;
          }
        },
        error: () => this.loadingReportes = false
      });
    }
  }

  private getReportes(prestadorId: number) {
    this.providerReportsService.getReports(prestadorId, this.filtroPeriodo).subscribe({
      next: (data) => {
        this.reportes = data;
        this.armarCharts(data);
        this.loadingReportes = false;
      },
      error: (e) => {
        console.error('Error cargando reportes:', e);
        this.loadingReportes = false;
      }
    });
  }

  private armarCharts(r: ProviderReports) {
    // Doughnut: especialidades
    this.chartEspecialidadesData = {
      labels: r.serviciosPorEspecialidad?.map(x => x.especialidad) || [],
      datasets: [{ data: r.serviciosPorEspecialidad?.map(x => x.cantidad) || [] }]
    };

    // Pie: estados
    this.chartEstadosData = {
      labels: ['Aceptadas', 'Pendientes', 'Rechazadas'],
      datasets: [{
        data: [
          r.aceptadas || 0,
          r.pendientes || 0,
          r.rechazadas || 0
        ]
      }]
    };

    // Line: ingresos por mes
    this.chartIngresosData = {
      labels: r.ingresosPorMes?.map(x => x.mes) || [],
      datasets: [{
        data: r.ingresosPorMes?.map(x => x.total) || []
      }]
    };
  }

  // ========== SECCIÓN TABLA ADMIN ==========

  cargarTablaAdmin(): void {
    if (!this.prestador?.id) return;

    this.cargandoTablaAdmin = true;
    this.serviceRequestService.getSolicitudesPrestador(this.prestador.id)
      .subscribe({
        next: (data) => {
          this.solicitudesTablaAdmin = data;
          this.solicitudesTablaAdminFiltradas = [...data];
          this.actualizarPaginacion();
          this.cargandoTablaAdmin = false;
        },
        error: (error) => {
          console.error('Error cargando tabla admin:', error);
          this.cargandoTablaAdmin = false;
        }
      });
  }

  // Métodos para filtros de tabla
  aplicarFiltrosTabla(): void {
    // Implementa la lógica de filtrado aquí
    let filtradas = [...this.solicitudesTablaAdmin];

    // Filtrar por fechas
    if (this.filtroFechaDesde) {
      filtradas = filtradas.filter(s =>
        new Date(s.fechaSolicitud) >= new Date(this.filtroFechaDesde)
      );
    }

    if (this.filtroFechaHasta) {
      filtradas = filtradas.filter(s =>
        new Date(s.fechaSolicitud) <= new Date(this.filtroFechaHasta)
      );
    }

    // Filtrar por estado
    if (this.filtroEstado) {
      filtradas = filtradas.filter(s => s.estado === this.filtroEstado);
    }

    // Filtrar por búsqueda
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      filtradas = filtradas.filter(s =>
        (s.pacienteNombre?.toLowerCase().includes(busqueda)) ||
        (s.servicioNombre?.toLowerCase().includes(busqueda)) ||
        (s.descripcion?.toLowerCase().includes(busqueda))
      );
    }

    this.solicitudesTablaAdminFiltradas = filtradas;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  limpiarFiltrosTabla(): void {
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.filtroEstado = '';
    this.filtroBusqueda = '';
    this.aplicarFiltrosTabla();
  }

  // Métodos de paginación
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarPaginacion();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPaginacion();
    }
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.solicitudesTablaAdminFiltradas.length / this.itemsPorPagina);
    const startIndex = (this.paginaActual - 1) * this.itemsPorPagina;
    const endIndex = startIndex + this.itemsPorPagina;
    this.solicitudesPaginadas = this.solicitudesTablaAdminFiltradas.slice(startIndex, endIndex);
  }

  // Métodos para acciones de tabla
  verDetalleSolicitud(solicitud: any): void {
    Swal.fire({
      title: 'Detalles de la Solicitud',
      html: `
        <div class="text-start">
          <p><strong>Paciente:</strong> ${solicitud.pacienteNombre || 'N/A'}</p>
          <p><strong>Servicio:</strong> ${solicitud.servicioNombre || 'N/A'}</p>
          <p><strong>Estado:</strong> ${solicitud.estado || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${solicitud.fechaSolicitud || 'N/A'}</p>
          <p><strong>Descripción:</strong> ${solicitud.descripcion || 'Sin descripción'}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  aceptarSolicitudTabla(id: number): void {
    this.aceptarSolicitud(id);
  }

  rechazarSolicitudTabla(id: number): void {
    this.rechazarSolicitud(id);
  }

  // Habilitar edición
  habilitarEdicion() {
    this.modoEdicion = true;
  }

  // Cancelar edición
  cancelarEdicion() {
    this.modoEdicion = false;
    if (this.prestador) {
      this.patchFormValues(this.prestador);
    }
  }

  // Ir a preguntas frecuentes
  irAPreguntasFrecuentes() {
    this.router.navigate(['/preguntas-frecuentes']);
  }

  logout() {
    this.authService.logout();
  }

  abrirFaq() {
    this.mostrarFaq = true;
  }

  cerrarFaq() {
    this.mostrarFaq = false;
  }
}
