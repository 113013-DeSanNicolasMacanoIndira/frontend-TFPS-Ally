export interface ServiceRequest {
  id: number;
  pacienteId: number;
  prestadorId: number | null;   // puede ser null
  especialidad: string;         // obligatorio
  descripcion: string;
  estado: string;
  fechaSolicitud: string;
}



