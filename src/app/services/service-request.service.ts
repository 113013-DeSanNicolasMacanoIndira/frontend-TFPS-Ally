// src/app/services/service-request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// =============================
// TIPOS / DTOs
// =============================

export interface ProviderDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  codigoEspecialidad: string; // código real ej: "KIN", "PSI", "TRA"
  usuarioId: number;
  nombreUsuario: string;
}

export interface TransporterDTO {
  id: number;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  telefono: string;
  direccion: string;
  zonaCobertura: string;
  activo: boolean;
  usuarioId: number;
}

export interface ServiceDTO {
  id: number;
  pacienteId: number;
  prestadorId: number | null;
  especialidad: string;
  descripcion: string;
  estado: string;
  fechaSolicitud: string;
}

export interface CrearServicePayload {
  pacienteId: number;
  prestadorId: number | null;
  especialidad: string;
  descripcion: string;
}

// =============================
// SERVICIO
// =============================

@Injectable({
  providedIn: 'root',
})
export class ServiceRequestService {
  private prestacionesApi = `${environment.apiUrl}/api/prestaciones`;
  private prestadoresApi = `${environment.apiUrl}/api/prestadores`;
  private transportistasApi = `${environment.apiUrl}/api/transportistas`;

  constructor(private http: HttpClient) {}

  // =============================
  // PRESTADORES / TRANSPORTISTAS
  // =============================
  getPrestadoresActivos(): Observable<ProviderDTO[]> {
    return this.http.get<ProviderDTO[]>(`${this.prestadoresApi}/activos`);
  }

  getTransportistasActivos(): Observable<TransporterDTO[]> {
    return this.http.get<TransporterDTO[]>(`${this.transportistasApi}/activos`);
  }
  getSolicitudesTransportista(): Observable<ServiceDTO[]> {
    return this.http.get<ServiceDTO[]>(`${this.prestacionesApi}/transportista`);
  }

  // =============================
  // PACIENTE
  // =============================
  getSolicitudesPaciente(idPaciente: number): Observable<ServiceDTO[]> {
    return this.http.get<ServiceDTO[]>(`${this.prestacionesApi}/paciente/${idPaciente}`);
  }

  crearSolicitud(data: CrearServicePayload): Observable<ServiceDTO> {
    return this.http.post<ServiceDTO>(this.prestacionesApi, data);
  }

  cancelarSolicitud(id: number): Observable<ServiceDTO> {
    return this.http.put<ServiceDTO>(`${this.prestacionesApi}/${id}/cancelar`, {});
  }

  // =============================
  // PRESTADOR / TRANSPORTISTA
  // =============================
  getSolicitudesPrestador(idPrestador: number): Observable<ServiceDTO[]> {
    return this.http.get<ServiceDTO[]>(`${this.prestacionesApi}/prestador/${idPrestador}`);
  }

  aceptar(id: number): Observable<ServiceDTO> {
    return this.http.put<ServiceDTO>(`${this.prestacionesApi}/${id}/aceptar`, {});
  }

  rechazar(id: number): Observable<ServiceDTO> {
    return this.http.put<ServiceDTO>(`${this.prestacionesApi}/${id}/rechazar`, {});
  }
}
