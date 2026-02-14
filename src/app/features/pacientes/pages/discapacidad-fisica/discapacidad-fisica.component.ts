import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-discapacidad-fisica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discapacidad-fisica.component.html',
  styleUrls: ['./discapacidad-fisica.component.css']
})
export class DiscapacidadFisicaComponent {

  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/portal-paciente']);
  }

}