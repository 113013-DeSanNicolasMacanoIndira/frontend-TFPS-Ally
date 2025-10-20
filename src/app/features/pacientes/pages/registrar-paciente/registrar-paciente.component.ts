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
  mensaje: string = '';

  constructor(private fb: FormBuilder) {
    this.pacienteForm = this.fb.group({
      dni: ['', Validators.required],
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono_contacto: ['', Validators.required],
      contacto_emergencia: [''],
      obra_social: [''],
      nro_afiliado: [''],
      direccion: [''],
      fecha_nacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      discapacidad: ['', Validators.required]
      
    });
  }

  onSubmit() {
    if (this.pacienteForm.valid) {
      this.mensaje = 'Paciente registrado correctamente ';
      this.pacienteForm.reset();
    } else {
      this.mensaje = 'Por favor, completá todos los campos.';
    }
  }

  onDelete() {
    this.pacienteForm.reset();
    this.mensaje = 'Formulario limpio';
  }
}
