import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../../services/patient.service';
import { AuthService } from '../../../../services/auth.service';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-paciente',
  standalone: true,
  templateUrl: './modificar-paciente.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ModificarPacienteComponent implements OnInit {
  form!: FormGroup;
  patient: any;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.patient = JSON.parse(localStorage.getItem('paciente')!);

    this.form = this.fb.group({
      telefono: [this.patient.telefono],
      direccion: [this.patient.direccion],
      tipoDiscapacidad: [this.patient.tipoDiscapacidad],
    });
  }
  mostrarAtencion() {
    Swal.fire({
      title: 'Atención',
      text: 'Comunicate con el servicio de atención al cliente de Ally',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
  }
  // ✅ ACÁ VA (por ejemplo arriba de guardarCambios o abajo, da igual)
  logout(): void {
    this.authService.logout();
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
  darDeBaja() {
    Swal.fire({
      title: '¿Darte de baja?',
      text: 'Esta acción puede desactivar tu cuenta/paciente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, darme de baja',
      cancelButtonText: 'Cancelar',
    }).then((res) => {
      if (!res.isConfirmed) return;

      this.patientService.delete(this.patient.id).subscribe({
        next: () => {
          Swal.fire('Listo', 'Tu baja fue registrada.', 'success');
          localStorage.removeItem('paciente');
          this.router.navigate(['/login']);
        },
        error: () => Swal.fire('Error', 'No se pudo procesar la baja.', 'error'),
      });
    });
  }
}
