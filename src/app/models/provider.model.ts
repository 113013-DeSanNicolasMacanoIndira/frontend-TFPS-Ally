export interface Provider {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoEspecialidad?: string;           // Para el combo box
  activo?: boolean;
  fechaRegistro?: Date;
  idUsuario?: number;


}
