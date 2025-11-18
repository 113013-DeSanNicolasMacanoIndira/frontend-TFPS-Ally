import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceRequestService } from '../../../services/service-request.service';
import { ServiceRequest } from '../../../models/service-request.model';

@Component({
  selector: 'app-portal-prestador',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './portal-prestador.component.html',
  styleUrls: ['./portal-prestador.component.scss'],
})
export class PortalPrestadorComponent implements OnInit {

  solicitudes: ServiceRequest[] = [];
  prestadorId!: number;
  cargando = true;
  username = '';

  constructor(
    private srService: ServiceRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('userId');
    const storedUser = localStorage.getItem('user');

    if (!storedId) {
      this.router.navigate(['/login']);
      return;
    }

    this.prestadorId = Number(storedId);

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      this.username = parsed.username ?? 'Prestador';
    }

    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.cargando = true;
    this.srService.getByPrestador(this.prestadorId).subscribe(res => {
      this.solicitudes = res;
      this.cargando = false;
    });
  }

  aceptar(id: number) {
    this.srService.aceptar(id).subscribe(() => this.cargarSolicitudes());
  }

  rechazar(id: number) {
    this.srService.rechazar(id).subscribe(() => this.cargarSolicitudes());
  }
}
