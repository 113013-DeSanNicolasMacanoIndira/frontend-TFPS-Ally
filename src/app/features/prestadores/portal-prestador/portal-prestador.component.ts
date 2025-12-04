import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceRequestService } from '../../../services/service-request.service';
import { AuthService } from '../../../services/auth.service';
import { ProviderService } from '../../../services/provider.service';
import { SpecialtyService } from '../../../services/specialty.service';
import { Provider } from '../../../models/provider.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-portal-prestador',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
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
  


  constructor(
    private fb: FormBuilder,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService,
    private providerService: ProviderService,
    private specialtyService: SpecialtyService,
    private router: Router
  ) {
    // Inicializar formulario reactivo (igual que en registrar-paciente)
    this.prestadorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      especialidadId: ['', Validators.required],
      matricula: [''],
      coberturaObraSocial: [false]
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
          { id: 5, codigo: 'OFT', nombre: 'Oftalmología' }
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

    this.prestadorForm.patchValue({
      nombre: prestador.nombre,
      apellido: prestador.apellido,
      email: prestador.email,
      telefono: prestador.telefono,
      direccion: prestador.direccion,
      especialidadId: especialidad?.id || '',

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
    }
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
