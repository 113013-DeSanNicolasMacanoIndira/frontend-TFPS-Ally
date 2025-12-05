export interface AdminMetrics {
  pacientes: number;
  prestadores: number;
  transportistas: number;
  admins: number;
  solicitudesPendientes: number;
  serviciosAceptados: number;
}

export interface AdminUser {
  id: number;
  nombre: string; // ✔ CAMBIO AQUÍ
  rol: string;
  activo: boolean;
}
