import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { ServiceRequestService } from '../../../services/service-request.service';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-portal-transportista',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass],
  templateUrl: './portal-transportista.component.html',
  styleUrls: ['./portal-transportista.component.scss'],
})
export class PortalTransportistaComponent implements OnInit {
  solicitudes: any[] = [];
  transportistaId!: number;
  cargando = true;
  username: string = '';

  constructor(private srService: ServiceRequestService, private authService: AuthService, public router: Router) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (!user || !user.id) {
      console.error('⚠ No hay usuario logueado o falta ID');
      return;
    }

    this.transportistaId = user.id;
    this.username = user.username ?? '';

    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.cargando = true;

    this.srService.getSolicitudesTransportista().subscribe((res) => {
      this.solicitudes = res;
      this.cargando = false;
    });
  }

  aceptar(id: number) {
    this.srService.aceptar(id).subscribe(() => {
      Swal.fire('Solicitud aceptada', '', 'success');
      this.cargarSolicitudes();
    });
  }

  rechazar(id: number) {
    this.srService.rechazar(id).subscribe(() => {
      Swal.fire('Solicitud rechazada', '', 'success');
      this.cargarSolicitudes();
    });
  }

  logout() {
    this.authService.logout();
  }
}
