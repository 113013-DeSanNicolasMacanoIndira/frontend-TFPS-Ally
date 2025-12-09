import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialtyService } from '../../services/specialty.service';

@Component({
  selector: 'app-admin-gestion-montos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-gestion-montos.component.html',
  styleUrls: ['./admin-gestion-montos.component.scss'],
})
export class AdminGestionMontosComponent implements OnInit {
  especialidades: any[] = [];

  constructor(private specialtyService: SpecialtyService) {}

  ngOnInit(): void {
    this.loadMontos();
  }

  // 🟦 Obtener especialidades desde el backend
  loadMontos(): void {
    this.specialtyService.getAll().subscribe({
      next: (data) => {
        this.especialidades = data.map((esp: any) => ({
          ...esp,
          monto: esp.importeConsulta, //  Ajustar nombre
          nuevoMonto: esp.importeConsulta, // Se guarda un valor editable sin perder el original
        }));
      },
      error: () => alert(' Error cargando montos'),
    });
  }

  // 🟧 Guardar cambios de un solo registro
  actualizarMonto(especialidad: any): void {
    this.specialtyService.updateMonto(especialidad.id, especialidad.nuevoMonto).subscribe({
      next: () => {
        especialidad.monto = especialidad.nuevoMonto;
        alert(`✔ Monto actualizado: $${especialidad.monto}`);
      },
      error: () => alert(' Error al actualizar monto'),
    });
  }
}
