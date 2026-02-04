// src/app/features/pacientes/pages/solicitudes-paciente/solicitudes-paciente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // ← AGREGAR ESTA IMPORTACIÓN
import Swal from 'sweetalert2';
import { MenuPacienteComponent } from '../../../../components/menu-paciente/menu-paciente.component';
import { ServiceRequestService } from '../../../../services/service-request.service';
import { AuthService } from '../../../../services/auth.service';

interface ProfesionalOpcion {
  id: number;
  nombre: string;
  especialidad: string;
  tipo: 'PRESTADOR' | 'TRANSPORTISTA';
}

@Component({
  selector: 'app-solicitudes-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MenuPacienteComponent, FormsModule, RouterModule], // ← AGREGAR RouterModule
  templateUrl: './solicitudes-paciente.component.html',
  styleUrls: ['./solicitudes-paciente.component.scss'],
})
export class SolicitudesPacienteComponent implements OnInit {
  solicitudForm!: FormGroup;

  username: string = '';
  userId!: number;

  profesionales: ProfesionalOpcion[] = [];
  solicitudes: any[] = [];

  filtroProfesional: string = '';
  cargandoSolicitudes = false;
  tieneSolicitudAceptada: boolean = false;
  tieneSolicitudesAceptadas: boolean = false;

  pacienteId!: number;

  constructor(
    private fb: FormBuilder,
    private serviceRequest: ServiceRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      console.error('No hay usuario logueado');
      return;
    }

    this.username = user.username ?? '';
    this.userId = user.id;

    // 🔥 IMPORTANTE: acá seteamos pacienteId
    this.pacienteId = user.id;

    this.solicitudForm = this.fb.group({
      tipo: ['PRESTADOR', Validators.required],
      idProfesional: [''],
      comentario: [''],
    });

    this.solicitudForm.get('tipo')!.valueChanges.subscribe(() => {
      this.cargarProfesionales();
    });

    this.cargarProfesionales();
    this.cargarSolicitudes();

    // 🔥 Activamos el verificador
    this.verificarSolicitudes();
    setInterval(() => this.verificarSolicitudes(), 4000);
  }

  verificarSolicitudes() {
    this.serviceRequest.getSolicitudesPaciente(this.pacienteId).subscribe({
      next: (sols) => {
        this.tieneSolicitudesAceptadas = sols.some((s) => s.estado === 'ACEPTADO');
      },
    });
  }

  // ==========================
  // PROFESIONALES
  // ==========================
  cargarProfesionales(): void {
    const tipo = this.solicitudForm.value.tipo;

    if (tipo === 'PRESTADOR') {
      this.serviceRequest.getPrestadoresActivos().subscribe({
        next: (data) => {
          this.profesionales = data.map((p: any) => ({
            id: p.id,
            nombre: `${p.nombre} ${p.apellido}`,
            especialidad: p.codigoEspecialidad,
            tipo: 'PRESTADOR',
          }));
        },
        error: () => {
          this.profesionales = [];
          Swal.fire('Error', 'No se pudieron cargar los prestadores.', 'error');
        },
      });
    } else {
      // Para transportista no mostramos lista (según lo que acordamos)
      this.profesionales = [];
      this.solicitudForm.patchValue({ idProfesional: '' });
    }
  }

  get profesionalesFiltrados(): ProfesionalOpcion[] {
    const term = this.filtroProfesional.toLowerCase();
    return this.profesionales.filter((p) =>
      (p.nombre + ' ' + p.especialidad).toLowerCase().includes(term)
    );
  }

  // ==========================
  // SOLICITUDES DEL PACIENTE
  // ==========================
  cargarSolicitudes(): void {
    this.cargandoSolicitudes = true;

    this.serviceRequest.getSolicitudesPaciente(this.userId).subscribe({
      next: (data) => {
        this.solicitudes = data;

        // 🔥 Detecta si hay alguna solicitud aceptada
        this.tieneSolicitudAceptada = this.solicitudes.some((s) => s.estado === 'ACEPTADO');

        this.cargandoSolicitudes = false;
      },
      error: () => {
        this.cargandoSolicitudes = false;
        Swal.fire('Error', 'No se pudieron cargar tus solicitudes.', 'error');
      },
    });
  }

  // 🔥 AGREGAR ESTE MÉTODO NUEVO
  contarSolicitudesAceptadas(): number {
    return this.solicitudes.filter(s => s.estado === 'ACEPTADO').length;
  }

  enviarSolicitud(): void {
    if (this.solicitudForm.invalid) {
      Swal.fire('Atención', 'Seleccioná el tipo de solicitud.', 'warning');
      return;
    }

    const tipo = this.solicitudForm.value.tipo as 'PRESTADOR' | 'TRANSPORTISTA';
    const idProfesional = this.solicitudForm.value.idProfesional || null;
    const comentario = this.solicitudForm.value.comentario || '';

    // Si es PRESTADOR, obligatorio elegir uno
    if (tipo === 'PRESTADOR' && !idProfesional) {
      Swal.fire('Atención', 'Seleccioná un prestador.', 'warning');
      return;
    }

    let especialidad: string;

    if (tipo === 'PRESTADOR') {
      const seleccionado = this.profesionales.find((p) => p.id === +idProfesional);

      if (!seleccionado?.especialidad) {
        Swal.fire('Error', 'El prestador no tiene especialidad configurada.', 'error');
        return;
      }

      // Usar SIEMPRE el código devuelto por backend
      especialidad = seleccionado.especialidad;
    } else {
      // Transportista usa una especialidad fija definida por negocio
      especialidad = 'TRANSPORTE_SANITARIO';
    }

    const payload = {
      pacienteId: this.userId,
      prestadorId: tipo === 'PRESTADOR' ? idProfesional : null,
      especialidad, // <-- ahora es SIEMPRE un código válido
      descripcion: comentario,
    };

    this.serviceRequest.crearSolicitud(payload).subscribe({
      next: () => {
        Swal.fire('Solicitud enviada', 'Tu solicitud fue registrada.', 'success');
        this.solicitudForm.patchValue({ comentario: '' });
        this.cargarSolicitudes();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
      },
    });
  }

  cancelarSolicitud(s: any): void {
    Swal.fire({
      title: '¿Cancelar solicitud?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
    }).then((res) => {
      if (!res.isConfirmed) return;

      this.serviceRequest.cancelarSolicitud(s.id).subscribe({
        next: () => {
          Swal.fire('Cancelada', 'La solicitud fue cancelada.', 'success');
          this.cargarSolicitudes();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cancelar la solicitud.', 'error');
        },
      });
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
