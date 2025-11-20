import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ServiceRequestService } from '../../../../services/service-request.service';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitudes-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './solicitudes-paciente.component.html',
  styleUrls: ['./solicitudes-paciente.component.scss']
})
export class SolicitudesPacienteComponent implements OnInit {

  solicitudForm!: FormGroup;
  profesionales: any[] = [];
  solicitudes: any[] = [];
  filtro: string = '';
  username: string = '';

  constructor(
    private fb: FormBuilder,
    private serviceRequest: ServiceRequestService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.solicitudForm = this.fb.group({
      tipo: ['', Validators.required],
      idProfesional: ['', Validators.required],
      comentario: ['']
    });

    this.cargarProfesionales();
    this.cargarSolicitudes();
  }

  cargarProfesionales() {
    this.serviceRequest.getProfesionalesDisponibles().subscribe(data => {
      this.profesionales = [
        ...data.prestadores.map((p: any) => ({
          id: p.id,
          nombre: p.nombre + ' ' + p.apellido,
          especialidad: p.codigoEspecialidad,
          tipo: 'PRESTADOR'
        })),
        ...data.transportistas.map((t: any) => ({
          id: t.id,
          nombre: t.nombre + ' ' + t.apellido,
          especialidad: 'TRANSPORTE',
          tipo: 'TRANSPORTISTA'
        }))
      ];
    });
  }

  cargarSolicitudes() {
    const user = this.authService.getUser();
    if (!user?.id) return;

    this.serviceRequest.getSolicitudesPaciente(user.id).subscribe(data => {
      this.solicitudes = data;
    });
  }

  profesionalesFiltrados() {
    return this.profesionales.filter(p =>
      (p.nombre + ' ' + p.especialidad).toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  enviarSolicitud() {
    const user = this.authService.getUser();
    if (!user?.id) {
      Swal.fire('Error', 'No hay usuario logueado.', 'error');
      return;
    }

    const payload = {
      idPaciente: user.id,
      idProfesional: this.solicitudForm.value.idProfesional,
      tipo: this.solicitudForm.value.tipo,
      comentario: this.solicitudForm.value.comentario
    };

    this.serviceRequest.crearSolicitud(payload).subscribe(() => {
      Swal.fire('Solicitud enviada', '', 'success');
      this.solicitudForm.reset();
      this.cargarSolicitudes();
    });
  }

  cancelarSolicitud(s: any) {
    this.serviceRequest.cancelarSolicitud(s.id).subscribe(() => {
      Swal.fire('Solicitud cancelada', '', 'success');
      this.cargarSolicitudes();
    });
  }
  logout() {
    this.authService.logout();
  }
}
