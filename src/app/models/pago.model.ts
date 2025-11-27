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
