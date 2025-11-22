import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {

  private api = `${environment.apiUrl}/api/prestaciones`;

  constructor(private http: HttpClient) {}

  // =============================
  // PROFESIONALES DISPONIBLES
  // =============================
  getProfesionalesDisponibles(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/profesionales/disponibles`);
  }

  // =============================
  // PACIENTE
  // =============================
  getSolicitudesPaciente(idPaciente: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/paciente/${idPaciente}`);
  }

  crearSolicitud(data: any): Observable<any> {
    return this.http.post(`${this.api}`, data);
  }

  cancelarSolicitud(id: number): Observable<any> {
    return this.http.put(`${this.api}/${id}/cancelar`, {});
  }

  // =============================
  // PRESTADOR / TRANSPORTISTA
  // =============================
  getSolicitudesPrestador(idPrestador: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/prestador/${idPrestador}`);
  }

  getSolicitudesConfirmadasPrestador(idPrestador: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/prestador/${idPrestador}/confirmadas`);
  }

  aceptar(id: number): Observable<any> {
    return this.http.put(`${this.api}/${id}/aceptar`, {});
  }

  rechazar(id: number): Observable<any> {
    return this.http.put(`${this.api}/${id}/rechazar`, {});
  }

  // =============================
  // PAGOS
  // =============================
  getEstadoPago(idSolicitud: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${idSolicitud}/pago`);
  }

  actualizarEstadoPago(idSolicitud: number, estadoPago: string): Observable<any> {
    return this.http.put(`${this.api}/${idSolicitud}/pago`, { estado: estadoPago });
  }

  // =============================
  // INFORMACIÓN ADICIONAL
  // =============================
  getDetalleSolicitud(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}/detalle`);
  }

  getHistorialSolicitudesPrestador(idPrestador: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/prestador/${idPrestador}/historial`);
  }
}
