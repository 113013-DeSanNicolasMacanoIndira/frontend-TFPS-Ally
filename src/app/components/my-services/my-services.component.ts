import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ServiceRequestService } from '../../services/service-request.service';

import { ServiceDTO } from '../../services/service-request.service';

@Component({
  selector: 'app-my-services',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './my-services.component.html'
})
export class MyServicesComponent implements OnInit {
  solicitudes: ServiceDTO[] = [];

  constructor(private serviceRequestService: ServiceRequestService) {}

  ngOnInit(): void {
    const pacienteId = Number(localStorage.getItem('userId'));
    this.serviceRequestService
      .getSolicitudesPaciente(pacienteId)
      .subscribe((data) => (this.solicitudes = data));
  }

  cancelar(id: number) {
    this.serviceRequestService.cancelarSolicitud(id).subscribe(() => {
      this.solicitudes = this.solicitudes.filter(s => s.id !== id);
    });
  }
}

