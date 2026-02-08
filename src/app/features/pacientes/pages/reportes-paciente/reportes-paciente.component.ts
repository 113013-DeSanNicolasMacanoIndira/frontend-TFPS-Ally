import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';

import { PatientReportsService, ReportResumenDTO, SerieDTO } from '../../../../services/patient-reports.service';
import { MenuPacienteComponent } from '../../../../components/menu-paciente/menu-paciente.component';
@Component({
  selector: 'app-reportes-paciente',
  standalone: true,
  imports: [CommonModule, BaseChartDirective,MenuPacienteComponent],
  templateUrl: './reportes-paciente.component.html',
  styleUrls: ['./reportes-paciente.component.scss']
})
export class ReportesPacienteComponent implements OnInit {

  resumen?: ReportResumenDTO;

  especialidades: SerieDTO[] = [];
  estados: SerieDTO[] = [];
  pagos: SerieDTO[] = [];

  // ✅ datasets listos para el template
  especialidadesChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  estadosChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  pagosChartData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: 'Pagos' }] };

  usuarioId = 1; // después sacalo del AuthService

  constructor(private reportsService: PatientReportsService) {}

  ngOnInit() {
    this.cargarReportes();
  }

  cargarReportes() {
    this.reportsService.resumen(this.usuarioId)
      .subscribe(r => this.resumen = r);

    this.reportsService.porEspecialidad(this.usuarioId)
      .subscribe(r => {
        this.especialidades = r;
        this.especialidadesChartData = {
          labels: r.map(x => x.label),
          datasets: [{ data: r.map(x => x.value) }]
        };
      });

    this.reportsService.porEstado(this.usuarioId)
      .subscribe(r => {
        this.estados = r;
        this.estadosChartData = {
          labels: r.map(x => x.label),
          datasets: [{ data: r.map(x => x.value) }]
        };
      });

    this.reportsService.pagosPorMes(this.usuarioId)
      .subscribe(r => {
        this.pagos = r;
        this.pagosChartData = {
          labels: r.map(x => x.label),
          datasets: [{ data: r.map(x => x.value), label: 'Pagos' }]
        };
      });
  }
}