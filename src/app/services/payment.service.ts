import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Pago, PaymentRequestDTO, MercadoPagoPreferenceResponse } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private API_URL = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtiene las solicitudes aceptadas de un paciente para pagar
   */
  getSolicitudesAceptadasParaPago(): Observable<any[]> {
    const user = this.authService.getUser();
    const pacienteId = user?.id;

    if (!pacienteId) {
      console.error('No se pudo obtener el ID del paciente');
      return of(this.getDatosPrueba());
    }

    return this.http.get<any[]>(`${this.API_URL}/prestaciones/paciente-aceptadas/${pacienteId}`);
  }

  /**
   * Crea un nuevo pago (para métodos tradicionales)
   */
  createPayment(paymentRequest: PaymentRequestDTO): Observable<Pago> {
    return this.http.post<Pago>(`${this.API_URL}/v1/payments/process`, paymentRequest);
  }

  /**
   * Crea una preferencia de pago en Mercado Pago
   */
  crearPreferenciaMercadoPago(paymentRequest: PaymentRequestDTO): Observable<MercadoPagoPreferenceResponse> {
    return this.http.post<MercadoPagoPreferenceResponse>(
      `${this.API_URL}/v1/payments/mercado-pago/preference`,
      paymentRequest
    );
  }

  /**
   * Datos de prueba por si el backend no está disponible
   */
  private getDatosPrueba(): any[] {
    return [
      {
        id: 1,
        especialidad: 'Fisioterapia',
        descripcion: 'Sesión de rehabilitación muscular',
        prestadorNombre: 'Dr. Juan Pérez',
        montoApagar: 4500,
        monto: 4500,
        fechaSolicitud: new Date(),
        estado: 'ACEPTADO',
      },
      {
        id: 2,
        especialidad: 'Enfermería',
        descripcion: 'Cuidados domiciliarios post-operatorios',
        prestadorNombre: 'Lic. María García',
        montoApagar: 3500,
        monto: 3500,
        fechaSolicitud: new Date(),
        estado: 'ACEPTADO',
      },
    ];
  }
}
