import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registrar-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-paciente.component.html',
  styleUrls: ['./registrar-paciente.component.scss']
})
export class RegistrarPacienteComponent {
  pacienteForm: FormGroup;

    this.pacienteForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono_contacto: ['', Validators.required],
      direccion: [''],
      fecha_nacimiento: ['', Validators.required],
    });
  }

  onSubmit() {
      this.pacienteForm.reset();
    }
  }

  onDelete() {
    this.pacienteForm.reset();
    this.mensaje = 'Formulario limpio';
  }
}
