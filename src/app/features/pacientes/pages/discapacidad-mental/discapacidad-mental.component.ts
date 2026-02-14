import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-discapacidad-mental',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discapacidad-mental.component.html',
  styleUrls: ['./discapacidad-mental.component.css']
})
export class DiscapacidadMentalComponent {
    constructor(private router: Router) {}

volver() {
  this.router.navigate(['/portal-paciente']);
}
}