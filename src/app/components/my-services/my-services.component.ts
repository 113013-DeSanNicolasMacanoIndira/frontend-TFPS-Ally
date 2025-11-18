import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ServiceRequestService } from '../../services/service-request.service';
import { ServiceRequest } from '../../models/service-request.model';

@Component({
  selector: 'app-my-services',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './my-services.component.html'
})
export class MyServicesComponent implements OnInit {
  solicitudes: ServiceRequest[] = [];

  constructor(private serviceRequestService: ServiceRequestService) {}

  ngOnInit(): void {
    const pacienteId = Number(localStorage.getItem('userId'));
    this.serviceRequestService
      .getByPaciente(pacienteId)
      .subscribe((data) => (this.solicitudes = data));
  }

  cancelar(id: number) {
    this.serviceRequestService.cancelar(id).subscribe(() => {
      this.solicitudes = this.solicitudes.filter(s => s.id !== id);
    });
  }
}

