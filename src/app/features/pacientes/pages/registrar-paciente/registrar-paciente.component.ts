import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService, Patient } from '../../../../services/patient.service';
import { AuthService } from '../../../../services/auth.service'; //  Importar AuthService
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-paciente.component.html',
  styleUrls: ['./registrar-paciente.component.scss']
})
export class RegistrarPacienteComponent {
  pacienteForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService //  Inyectar AuthService
  ) {
    this.pacienteForm = this.fb.group({
      dni: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono_contacto: ['', Validators.required],
      obra_social: ['', Validators.required],
      nro_afiliado: ['', Validators.required],
      direccion: [''],
      fecha_nacimiento: ['', Validators.required],
      discapacidad: ['']
    });
  }

  onSubmit() {
    if (this.pacienteForm.invalid) {
      Swal.fire('Atención', 'Completá todos los campos requeridos.', 'warning');
      this.pacienteForm.markAllAsTouched();
      return;
    }

    // Tomamos el usuario logueado del AuthService
    const loggedUser = this.authService.getUser();

    if (!loggedUser) {
      Swal.fire('Error', 'No hay usuario logueado. Iniciá sesión nuevamente.', 'error');
      return;
    }

    this.loading = true;
    const formValue = this.pacienteForm.value;

    //  Usamos el id real del usuario logueado
    const payload: Patient = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      fechaNacimiento: formValue.fecha_nacimiento,
      direccion: formValue.direccion,
      telefono: formValue.telefono_contacto,
      telegram: null,
      correoElectronico: formValue.email,
      idUsuario: loggedUser.id, //  aquí está la clave del cambio
      numeroHistoriaClinica: formValue.dni,
      codigoObraSocial: formValue.obra_social,
      nroAfiliadoObraSocial: formValue.nro_afiliado,
      tipoDiscapacidad: formValue.discapacidad || null
    };

    console.log(' Payload enviado:', payload);

    this.patientService.create(payload).subscribe({
      next: (created) => {
        this.loading = false;
        Swal.fire('Éxito', `Paciente registrado correctamente (ID: ${created.id ?? 'sin ID'})`, 'success');
        this.pacienteForm.reset();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error backend:', err);
        Swal.fire('Error', 'No se pudo registrar el paciente en el servidor.', 'error');
      }
    });
  }

  onDelete() {
    this.pacienteForm.reset();
    Swal.fire('Formulario limpio', '', 'info');
  }
}
