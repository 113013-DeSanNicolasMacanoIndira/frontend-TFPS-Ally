export interface ReporteEspecialidadItem {
  especialidad: string;
  cantidad: number;
}

export interface ReporteIngresosMesItem {
  mes: string;   // ej: "Nov", "Dic", "Ene"...
  total: number; // ARS
}

export interface ProviderReports {
  totalSolicitudes: number;
  aceptadas: number;
  rechazadas: number;
  pendientes: number;
  ingresosTotales: number;

  serviciosPorEspecialidad: ReporteEspecialidadItem[];
  ingresosPorMes: ReporteIngresosMesItem[];
}