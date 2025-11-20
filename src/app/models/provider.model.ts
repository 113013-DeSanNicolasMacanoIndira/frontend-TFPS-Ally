export interface Provider {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoEspecialidad: string;
  activo?: boolean;
  usuarioId?: number;
  nombreUsuario?: string;
}
