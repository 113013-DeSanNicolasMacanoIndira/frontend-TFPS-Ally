import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMetrics, AdminUser } from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  getMetrics(fechaDesde?: string, fechaHasta?: string): Observable<AdminMetrics> {
    let params: any = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    return this.http.get<AdminMetrics>(`${this.apiUrl}/metrics`, { params });
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  toggleUser(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}/toggle`, {});
  }

  //  Gráficos admin
  getPagosPorEspecialidad(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pagos-por-especialidad`);
  }

  //  Solicitudes con nombres reales
  getSolicitudesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/services/detalle/pendientes`);
  }

  getServiciosAceptados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/services/detalle/aceptados`);
  }

  //  Pagos totales
  getPagos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pagos`);
  }
}
