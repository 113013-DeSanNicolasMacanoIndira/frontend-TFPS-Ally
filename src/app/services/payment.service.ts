import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private API_URL = `${environment.apiUrl}/api/prestaciones`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtiene las solicitudes aceptadas de un paciente para pagar
   * Usa el endpoint: GET /api/pagos-paciente-aceptadas/{idPaciente}
   */
  getSolicitudesAceptadasParaPago(): Observable<any[]> {
    const user = this.authService.getUser();
    const pacienteId = user?.id;

    if (!pacienteId) {
      console.error('No se pudo obtener el ID del paciente');
      return of(this.getDatosPrueba());
    }

    return this.http.get<any[]>(`${this.API_URL}/paciente-aceptadas/${pacienteId}`);
  }

  /**
   * Crea un nuevo pago
   * (Ajusta el endpoint según tu backend)
   */
  createPayment(paymentData: any): Observable<any> {
    // Endpoint temporal - ajusta según tu backend
    return this.http.post<any>(`${this.API_URL}/pagos`, paymentData);

    // O si prefieres simulación:
    // return of(this.simularPagoExitoso(paymentData));
  }

  /**
   * Datos de prueba por si el backend no está disponible
   */
  private getDatosPrueba(): any[] {
    return [
      {
        id: 1,
        especialidad: 'FISIOTERAPIA',
        descripcion: 'Sesión de rehabilitación muscular',
        prestadorNombre: 'Dr. Juan Pérez',
        prestadorId: 101,
        monto: 4500,
        fechaSolicitud: new Date('2025-11-27'),
        estado: 'ACEPTADO',
        pagado: false
      },
      {
        id: 2,
        especialidad: 'ENFERMERIA',
        descripcion: 'Cuidados domiciliarios post-operatorios',
        prestadorNombre: 'Lic. María García',
        prestadorId: 102,
        monto: 3500,
        fechaSolicitud: new Date('2025-11-26'),
        estado: 'ACEPTADO',
        pagado: false
      },
      {
        id: 3,
        especialidad: 'TERAPIA_OCUPACIONAL',
        descripcion: 'Terapia de integración sensorial',
        prestadorNombre: 'Lic. Carlos López',
        prestadorId: 103,
        monto: 5000,
        fechaSolicitud: new Date('2025-11-25'),
        estado: 'ACEPTADO',
        pagado: false
      }
    ];
  }

  /**
   * Simula un pago exitoso
   */
  private simularPagoExitoso(paymentData: any): any {
    return {
      id: Math.floor(Math.random() * 10000),
      ...paymentData,
      estadoPago: 'COMPLETADO',
      numeroTransaccion: 'TX-' + Date.now(),
      fechaPago: new Date(),
      mensaje: 'Pago procesado exitosamente'
    };
  }
}
