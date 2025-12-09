import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../services/admin.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-charts',
  standalone: true,
  templateUrl: './admin-charts.component.html',
  styleUrls: ['./admin-charts.component.scss']
})
export class AdminChartsComponent implements OnInit {

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData() {
    this.adminService.getPagosPorEspecialidad().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          alert("No hay datos para mostrar aún");
          return;
        }

        const labels = data.map(x => x.especialidad);
        const values = data.map(x => x.cantidad);

        new Chart("serviciosChart", {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Servicios Pagados',
              data: values,
              backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384', '#8E44AD']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true, position: 'top' }
            }
          }
        });
      },
      error: () => {
        alert(' Error cargando datos del gráfico');
      }
    });
  }
}