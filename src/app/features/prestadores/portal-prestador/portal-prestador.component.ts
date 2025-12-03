import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  //  NECESARIO
import { NgClass } from '@angular/common';        // para [ngClass]
import { ServiceRequestService } from '../../../services/service-request.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-portal-prestador',
  standalone: true,                     //  SI USÁS STANDALONE HAY QUE IMPORTAR TODO
  imports: [
    CommonModule,                       // HABILITA *ngIf, *ngFor
    NgClass                             // HABILITA [ngClass]
  ],
  templateUrl: './portal-prestador.component.html',
  styleUrls: ['./portal-prestador.component.scss']
})
export class PortalPrestadorComponent implements OnInit {
  mostrarFaq = false;
  solicitudes: any[] = [];
  cargando = true;
  username: string = '';

  constructor(
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();

    if (!user || !user.id) {
      console.error("⚠ No hay usuario logueado o falta el ID");
      return;
    }

    this.username = user.username ?? '';

    this.serviceRequestService.getSolicitudesPrestador(user.id)
      .subscribe(data => {
        this.solicitudes = data;
        this.cargando = false;
      });
  }

  aceptar(id: number) {
    const user = this.authService.getUser();
    if (!user || !user.id) return;

    this.serviceRequestService.aceptar(id).subscribe(() => {
      Swal.fire('Solicitud aceptada', '', 'success');
      this.refrescar();
    });
  }

  rechazar(id: number) {
    const user = this.authService.getUser();
    if (!user || !user.id) return;

    this.serviceRequestService.rechazar(id).subscribe(() => {
      Swal.fire('Solicitud rechazada', '', 'success');
      this.refrescar();
    });
  }

  refrescar() {
    const user = this.authService.getUser();
    if (!user || !user.id) return;

    this.serviceRequestService.getSolicitudesPrestador(user.id)
      .subscribe(data => this.solicitudes = data);
  }

  logout() {
    this.authService.logout();
  }
   abrirFaq() {
    this.mostrarFaq = true;
  }

  cerrarFaq() {
    this.mostrarFaq = false;
  }
}
