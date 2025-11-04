import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService, Patient } from '../../../../services/patient.service';

@Component({
  selector: 'app-registrar-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-paciente.component.html',
  styleUrls: ['./registrar-paciente.component.scss']
})
export class RegistrarPacienteComponent {
  pacienteForm: FormGroup;
  mensaje = '';
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.pacienteForm = this.fb.group({
      dni: ['', Validators.required],                     // backend NO tiene dni, lo usamos como historia clínica
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono_contacto: ['', Validators.required],
      contacto_emergencia: [''],                           // backend no lo usa aún
      obra_social: ['', Validators.required],
      nro_afiliado: ['', Validators.required],
      direccion: [''],
      fecha_nacimiento: ['', Validators.required],
      genero: ['', Validators.required],                   // backend no lo usa aún
      discapacidad: ['']                                   // -> mapea a tipoDiscapacidad
    });
  }

  onSubmit() {
     console.log(' Formulario enviado - ejecutando onSubmit()');
    if (this.pacienteForm.invalid) {
      this.mensaje = 'Por favor, completá todos los campos requeridos.';
      this.pacienteForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.mensaje = '';
    this.error = '';

    const formValue = this.pacienteForm.value;

    // lo que enviamos al backend
    const payload: Patient = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      fechaNacimiento: formValue.fecha_nacimiento, // formato "YYYY-MM-DD"
      direccion: formValue.direccion,
      telefono: formValue.telefono_contacto,
      telegram: null as any,
      correoElectronico: formValue.email,
      idUsuario: 1, // valor fijo por ahora

      numeroHistoriaClinica: formValue.dni, // usamos DNI como historia clínica
      codigoObraSocial: formValue.obra_social,
      nroAfiliadoObraSocial: formValue.nro_afiliado,
      tipoDiscapacidad: formValue.discapacidad || null
    };

    //  Debug: mostramos qué se está enviando
    console.log('Payload enviado al backend:', payload);
    console.log('JSON plano que se envía:', JSON.stringify(payload));

    //Llamada real al backend
    this.patientService.create(payload).subscribe({
      next: (created) => {
        this.loading = false;
        this.mensaje = ` Paciente registrado correctamente (ID: ${created.id ?? 'sin ID'})`;
        this.pacienteForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.error = ' No se pudo registrar el paciente en el servidor.';
        console.error('Error backend:', err);
      }
    });
  }

  // Limpia el formulario
  onDelete() {
    this.pacienteForm.reset();
    this.mensaje = ' Formulario limpio';
    this.error = '';
  }
}
