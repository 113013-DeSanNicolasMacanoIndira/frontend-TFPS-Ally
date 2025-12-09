import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMetrics, AdminUser } from '../models/admin.model';
import { environment } from '../../environments/environment';
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
  getPagosPorEspecialidad(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pagos-por-especialidad`);
  }
  getServicesByEstado(estado: string) {
    return this.http.get<any[]>(`${this.apiUrl}/services?estado=${estado}`);
  }

  getPagos() {
    return this.http.get<any[]>(`${this.apiUrl}/pagos`);
  }
}
