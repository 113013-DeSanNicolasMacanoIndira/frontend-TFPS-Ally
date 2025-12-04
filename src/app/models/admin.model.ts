export interface AdminMetrics {
  pacientes: number;
  prestadores: number;
  transportistas: number;
  admins: number;
}

export interface AdminUser {
  id: number;
  usuario: string;
  rol: string;
  activo: boolean;
}
