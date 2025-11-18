import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '../../services/provider.service';
import { ServiceRequestService } from '../../services/service-request.service';
import { Provider } from '../../models/provider.model';
import { ServiceRequest } from '../../models/service-request.model';

@Component({
  selector: 'app-service-request',
  standalone: true, // si tus componentes son standalone
  imports: [CommonModule, FormsModule], // importante
  templateUrl: './service-request.component.html'
})
export class ServiceRequestComponent implements OnInit {
  provider?: Provider;
  descripcion = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ProviderService,
    private serviceRequestService: ServiceRequestService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.providerService.getById(id).subscribe(p => (this.provider = p));
  }

  solicitar(): void {
    if (!this.provider) return;

    const pacienteId = Number(localStorage.getItem('userId'));
    const request: ServiceRequest = {
      pacienteId,
      prestadorId: this.provider.id!,
      especialidad: this.provider.codigoEspecialidad,
      descripcion: this.descripcion
    };

    this.serviceRequestService.create(request).subscribe(() => {
      alert(' Solicitud enviada correctamente');
      this.router.navigate(['/mis-prestaciones']);
    });
  }
}
