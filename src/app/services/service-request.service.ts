import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceRequest } from '../models/service-request.model';

@Injectable({ providedIn: 'root' })
export class ServiceRequestService {
  private baseUrl = `${environment.apiUrl}/api/servicios`;

  constructor(private http: HttpClient) {}

  create(request: ServiceRequest): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.baseUrl, request);
  }

  getByPaciente(idPaciente: number): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.baseUrl}/paciente/${idPaciente}`);
  }

  getByPrestador(idPrestador: number): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.baseUrl}/prestador/${idPrestador}`);
  }

  aceptar(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/aceptar`, {});
  }

  rechazar(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/rechazar`, {});
  }

  cancelar(id: number) {
  return this.http.put(`${this.baseUrl}/${id}/cancelar`, {});
}



}
