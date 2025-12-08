export interface Provider {
  id?: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  email: string;
  telegram?:string;
  telefono: string;
  direccion: string;
  codigoEspecialidad?: string;

  activo?: boolean;
  cbuBancaria:string;
  fechaRegistro?: Date | string;
  idUsuario?: number;
  matricula?: string;
  // Opcional: para mostrar en UI
  coberturaObraSocial?: boolean;
  especialidadNombre?: string;

}
