import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { ServiceRequestService } from '../../../services/service-request.service';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { PatientApiService } from '../../../services/patient-api.service';
import { forkJoin, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import {
  TransporterApiService,
  TransporterCreateDTO,
} from '../../../services/transporter-api.service';
@Component({
  selector: 'app-portal-transportista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, NgFor, NgClass],
  templateUrl: './portal-transportista.component.html',
  styleUrls: ['./portal-transportista.component.scss'],
})
export class PortalTransportistaComponent implements OnInit {
  solicitudes: any[] = [];
  transportistaId!: number;
  cargando = true;
  username: string = '';
  seccionActiva: 'solicitudes' | 'zonas' | 'registro' = 'solicitudes';
  //  Registro transportista
  loadingPerfil = true;
  esNuevoTransportista = false;
  transportista: any = null;

  transportistaForm!: FormGroup;
  zonas: string[] = [];
  constructor(
    private srService: ServiceRequestService,
    private authService: AuthService,
    public router: Router,
    private patientApi: PatientApiService,
    private transporterApi: TransporterApiService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user?.id) return;

    this.username = user.username ?? '';

    // form
    this.transportistaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correoElectronico: [user.email ?? '', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      telegram: [''],
      zonaCobertura: ['', Validators.required],
    });

    // cargar zonas (opcional, podés hardcodear si querés)
    this.transporterApi.getZonasCobertura().subscribe({
      next: (z) => {
        console.log('✅ Zonas cobertura:', z);
        this.zonas = z ?? [];
      },
      error: (e) => {
        console.error('❌ Error trayendo zonas cobertura:', e);
        this.zonas = [];
      },
    });

    //  chequear si ya está registrado como transportista
    this.transporterApi
      .getByUsuarioId(user.id)
      .pipe(catchError(() => of(null)))
      .subscribe((t) => {
        this.transportista = t;
        this.esNuevoTransportista = !t;
        this.loadingPerfil = false;

        // ✅ sección por defecto
        this.seccionActiva = this.esNuevoTransportista ? 'registro' : 'solicitudes';

        if (t) this.cargarSolicitudes();
      });
  }
  cambiarSeccion(sec: 'solicitudes' | 'zonas' | 'registro') {
    this.seccionActiva = sec;

    // si entra a solicitudes y está registrado, cargalas
    if (sec === 'solicitudes' && !this.esNuevoTransportista) {
      this.cargarSolicitudes();
    }
  }

  irZonas() {
    this.router.navigate(['/transportista/zonas']);
  }

  cargarSolicitudes() {
    this.cargando = true;

    this.srService.getSolicitudesTransportista().subscribe((res: any[]) => {
      // ids únicos de pacientes
      const ids = Array.from(
        new Set(res.map((s) => Number(s.pacienteId)).filter((id) => !Number.isNaN(id))),
      );

      // si no hay pacientes
      if (ids.length === 0) {
        this.solicitudes = res;
        this.cargando = false;
        return;
      }

      // armar requests para traer pacientes
      const reqs = ids.map((id) =>
        this.patientApi.getPaciente(id).pipe(
          catchError((err) => {
            console.error('No pude traer paciente', id, err);
            return of(null);
          }),
        ),
      );

      forkJoin(reqs).subscribe((pacientes: any[]) => {
        // map id -> direccion
        const dirPorPaciente = new Map<number, string>();
        pacientes.forEach((p) => {
          // 👇 acá puede variar el nombre del id (a veces viene pacienteId)
          const pid = Number(p?.id ?? p?.pacienteId);
          if (!Number.isNaN(pid)) {
            dirPorPaciente.set(pid, (p?.direccion ?? '').trim());
          }
        });

        // enriquecer solicitudes
        this.solicitudes = res.map((s) => ({
          ...s,
          direccionPaciente: dirPorPaciente.get(Number(s.pacienteId)) ?? '',
        }));

        this.cargando = false;
      });
    });
  }
  registrarTransportista() {
    if (this.transportistaForm.invalid) {
      this.transportistaForm.markAllAsTouched();
      Swal.fire('Atención', 'Completá los campos obligatorios.', 'warning');
      return;
    }

    const user = this.authService.getUser();
    if (!user?.id) return;

    const v = this.transportistaForm.value;

    const payload: TransporterCreateDTO = {
      nombre: v.nombre,
      apellido: v.apellido,
      fechaNacimiento: v.fechaNacimiento,
      direccion: v.direccion,
      telefono: v.telefono,
      telegram: v.telegram || null,
      correoElectronico: v.correoElectronico,
      usuarioId: user.id,
      zonaCobertura: v.zonaCobertura,
    };

    this.loadingPerfil = true;

    this.transporterApi.create(payload).subscribe({
      next: (created) => {
        this.transportista = created;
        this.esNuevoTransportista = false;
        this.loadingPerfil = false;

        Swal.fire('Listo', 'Transportista registrado correctamente.', 'success');

        // ✅ ahora sí: cargar portal
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.loadingPerfil = false;
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar el transportista.', 'error');
      },
    });
  }

  aceptar(id: number) {
    this.srService.aceptar(id).subscribe(() => {
      Swal.fire('Solicitud aceptada', '', 'success');
      this.cargarSolicitudes();
    });
  }

  rechazar(id: number) {
    this.srService.rechazar(id).subscribe(() => {
      Swal.fire('Solicitud rechazada', '', 'success');
      this.cargarSolicitudes();
    });
  }

  logout() {
    this.authService.logout();
  }
}
