import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ReportResumenDTO {
  totalServicios: number;
  aceptados: number;
  pendientes: number;
  rechazados: number;
  totalPagado: number;
}

export interface SerieDTO {
  label: string;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class PatientReportsService {
  private baseUrl = 'http://localhost:8080/api/pacientes';

  constructor(private http: HttpClient) {}

  resumen(usuarioId: number, months = 6) {
    return this.http.get<ReportResumenDTO>(`${this.baseUrl}/${usuarioId}/reportes/resumen?months=${months}`);
  }

  porEspecialidad(usuarioId: number, months = 6) {
    return this.http.get<SerieDTO[]>(`${this.baseUrl}/${usuarioId}/reportes/servicios-por-especialidad?months=${months}`);
  }

  porEstado(usuarioId: number, months = 6) {
    return this.http.get<SerieDTO[]>(`${this.baseUrl}/${usuarioId}/reportes/servicios-por-estado?months=${months}`);
  }

  pagosPorMes(usuarioId: number, months = 6) {
    return this.http.get<SerieDTO[]>(`${this.baseUrl}/${usuarioId}/reportes/pagos-por-mes?months=${months}`);
  }
}