import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pago, MetodoPago, EstadoPago } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl + '/pagos';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las solicitudes aceptadas del paciente para pagar
   */
  getSolicitudesAceptadasParaPago(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes-aceptadas`);
  }

  /**
   * Crea un nuevo pago
   */
  createPayment(paymentData: any): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, paymentData);
  }

  /**
   * Procesa un pago con Mercado Pago
   */
  processMercadoPago(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/mercado-pago`, paymentData);
  }

  /**
   * Obtiene el historial de pagos del paciente
   */
  getPaymentHistory(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/historial`);
  }

  /**
   * Obtiene los detalles de un pago específico
   */
  getPaymentDetails(paymentId: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${paymentId}`);
  }
}
