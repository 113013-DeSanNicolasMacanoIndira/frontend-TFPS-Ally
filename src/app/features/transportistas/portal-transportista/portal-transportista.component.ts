import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { ServiceRequestService } from '../../../services/service-request.service';
import { Router } from '@angular/router';
import { ServiceRequest } from '../../../models/service-request.model';

@Component({
  selector: 'app-portal-transportista',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './portal-transportista.component.html',
  styleUrls: ['./portal-transportista.component.scss'],
})
export class PortalTransportistaComponent implements OnInit {

  solicitudes: ServiceRequest[] = [];
  transportistaId!: number;
  cargando = true;

  constructor(
    private srService: ServiceRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('userId');

    if (!storedId) {
      this.router.navigate(['/login']);
      return;
    }

    this.transportistaId = Number(storedId);
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.cargando = true;
    this.srService.getByPrestador(this.transportistaId).subscribe(res => {
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
