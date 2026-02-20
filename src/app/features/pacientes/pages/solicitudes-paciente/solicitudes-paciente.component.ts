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
import { TransporterApiService } from '../../../../services/transporter-api.service';

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
  transportistas: any[] = [];
  filtroTransportista: string = '';
  cargandoSolicitudes = false;
  tieneSolicitudAceptada: boolean = false;
  tieneSolicitudesAceptadas: boolean = false;

  pacienteId!: number;

  constructor(
    private fb: FormBuilder,
    private serviceRequest: ServiceRequestService,
    private authService: AuthService,
    private transporterApi: TransporterApiService,
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
      idTransportista: [''],
      comentario: [''],
    });

    this.solicitudForm.get('tipo')!.valueChanges.subscribe((tipo) => {
      if (tipo === 'PRESTADOR') {
        this.solicitudForm.patchValue({ idTransportista: '' });
        this.cargarProfesionales();
      } else {
        this.solicitudForm.patchValue({ idProfesional: '' });
        this.cargarTransportistas(); // ✅ NUEVO
      }
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
  cargarTransportistas(): void {
    this.transporterApi.getActivos().subscribe({
      next: (data) => {
        this.transportistas = data ?? [];
      },
      error: () => {
        this.transportistas = [];
        Swal.fire('Error', 'No se pudieron cargar los transportistas.', 'error');
      },
    });
  }

  get transportistasFiltrados(): any[] {
    const term = (this.filtroTransportista || '').toLowerCase();
    return this.transportistas.filter((t) =>
      `${t.nombre} ${t.apellido} ${t.zonaCobertura ?? ''}`.toLowerCase().includes(term),
    );
  }

  get profesionalesFiltrados(): ProfesionalOpcion[] {
    const term = this.filtroProfesional.toLowerCase();
    return this.profesionales.filter((p) =>
      (p.nombre + ' ' + p.especialidad).toLowerCase().includes(term),
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
    return this.solicitudes.filter((s) => s.estado === 'ACEPTADO').length;
  }

  enviarSolicitud(): void {
    if (this.solicitudForm.invalid) {
      Swal.fire('Atención', 'Seleccioná el tipo de solicitud.', 'warning');
      return;
    }

    const tipo = this.solicitudForm.value.tipo as 'PRESTADOR' | 'TRANSPORTISTA';
    const comentario = this.solicitudForm.value.comentario || '';

    // ===== PRESTADOR =====
    if (tipo === 'PRESTADOR') {
      const idProfesional = this.solicitudForm.value.idProfesional;

      if (!idProfesional) {
        Swal.fire('Atención', 'Seleccioná un prestador.', 'warning');
        return;
      }

      const seleccionado = this.profesionales.find((p) => p.id === +idProfesional);
      if (!seleccionado?.especialidad) {
        Swal.fire('Error', 'El prestador no tiene especialidad configurada.', 'error');
        return;
      }

      const payload = {
        pacienteId: this.userId, // ✅ en tu back se usa como usuarioId
        prestadorId: +idProfesional,
        transportistaId: null,
        especialidad: seleccionado.especialidad,
        descripcion: comentario,
        
        montoApagar: null,
      };

      this.serviceRequest.crearSolicitud(payload).subscribe({
        next: () => {
          Swal.fire('Solicitud enviada', 'Tu solicitud fue registrada.', 'success');
          this.solicitudForm.patchValue({ comentario: '' });
          this.cargarSolicitudes();
        },
        error: () => Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error'),
      });

      return;
    }

    // ===== TRANSPORTISTA =====
    const idTransportista = this.solicitudForm.value.idTransportista;

    if (!idTransportista) {
      Swal.fire('Atención', 'Seleccioná un transportista.', 'warning');
      return;
    }

    const payload = {
      pacienteId: this.userId, // ✅ en tu back se usa como usuarioId
      prestadorId: null,
      transportistaId: +idTransportista, // ✅ CLAVE
      especialidad: 'TRANSPORTE_SANITARIO', // ✅ coincide con listarSolicitudesTransportista()
      descripcion: comentario,
      montoApagar: null,
    };

    this.serviceRequest.crearSolicitud(payload).subscribe({
      next: () => {
        Swal.fire('Solicitud enviada', 'Tu solicitud fue registrada.', 'success');
        this.solicitudForm.patchValue({ comentario: '' });
        this.cargarSolicitudes();
      },
      error: () => Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error'),
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
