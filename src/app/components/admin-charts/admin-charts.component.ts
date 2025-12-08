import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-charts',
  standalone: true,
  templateUrl: './admin-charts.component.html',
  styleUrls: ['./admin-charts.component.scss']
})
export class AdminChartsComponent implements OnInit {

  ngOnInit(): void {
    this.createServiciosChart();
  }

  createServiciosChart() {
    new Chart("serviciosChart", {
      type: 'bar',
      data: {
        labels: ['Psicología', 'Enfermería', 'Kinesiología', 'Transporte'],
        datasets: [{
          label: 'Servicios Pagados',
          backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384'],
          data: [3, 1, 4, 2]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }
}