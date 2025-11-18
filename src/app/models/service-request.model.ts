export interface ServiceRequest {
  id?: number;
  pacienteId: number;
  prestadorId: number;
  estado?: string; // ⬅ opcional
  fechaSolicitud?: string;
  especialidad?: string;
  descripcion?: string;
}



