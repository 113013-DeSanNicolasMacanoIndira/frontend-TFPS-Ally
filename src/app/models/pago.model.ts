export interface Pago {
  id?: number;
  solicitudServicioId: number;
  pacienteId: number;
  prestadorId: number;
  monto: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'OBRA_SOCIAL' | 'MERCADO_PAGO';
  estado: 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'PROCESANDO';

  // Datos específicos
  numeroTransaccion?: string;
  datosObraSocial?: {
    numeroAfiliado: string;
    plan: string;
    telefono: string;
  };
  datosTransferencia?: {
    numeroCuenta: string;
    nombreTitular: string;
    cbu: string;
  };

  fechaCreacion?: Date;
  fechaCompletado?: Date;
}

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'OBRA_SOCIAL' | 'MERCADO_PAGO';
export type EstadoPago = 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'PROCESANDO';

// DTO para enviar al backend - DEBE COINCIDIR CON EL PaymentRequestDTO DE JAVA
export interface PaymentRequestDTO {
  servicioId: number;
  metodoPago: 'CONTADO' | 'TRANSFERENCIA_BANCARIA' | 'OBRA_SOCIAL' | 'MERCADO_PAGO';
  monto: number;
  emailPagador?: string;
  nombrePagador?: string;
  cbuDestino?: string;
  numeroAfiliado?: string;
  codigoObraSocial?: string;
  datosAdicionales?: { [key: string]: any };
  returnUrl?: string;
  cancelUrl?: string;
}

// Respuesta de Mercado Pago
export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: {
    email: string;
  };
  external_reference: string;
  notification_url: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
}
