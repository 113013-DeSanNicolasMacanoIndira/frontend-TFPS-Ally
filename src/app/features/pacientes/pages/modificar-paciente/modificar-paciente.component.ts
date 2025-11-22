import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../../services/patient.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-paciente',
  standalone: true,
  templateUrl: './modificar-paciente.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModificarPacienteComponent implements OnInit {
  form!: FormGroup;
  patient: any;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patient = JSON.parse(localStorage.getItem('paciente')!);

    this.form = this.fb.group({
      telefono: [this.patient.telefono],
      direccion: [this.patient.direccion],
      tipoDiscapacidad: [this.patient.tipoDiscapacidad],
    });
  }

  guardarCambios() {
    this.patientService
      .updatePartial({
        id: this.patient.id,
        telefono: this.form.value.telefono,
        direccion: this.form.value.direccion,
        tipoDiscapacidad: this.form.value.tipoDiscapacidad,
      })
      .subscribe({
        next: () => {
          // Luego del PATCH, recargamos el paciente del backend
          const user = JSON.parse(localStorage.getItem('user')!);

          this.patientService.getByUserId(user.id).subscribe({
            next: (updatedPatient) => {
              //  Guardamos el paciente ACTUALIZADO
              localStorage.setItem('paciente', JSON.stringify(updatedPatient));

              // SWEETALERT2
              Swal.fire({
                title: '¡Datos actualizados!',
                text: 'Los cambios se guardaron correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
              });

              //  Redirigimos
              this.router.navigate(['/portal-pacientes']);
            },
            error: () => alert('Error al recargar datos actualizado'),
          });
        },

        error: () => alert('Error al actualizar'),
      });
  }
}
