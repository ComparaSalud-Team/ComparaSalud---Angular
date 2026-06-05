export type EstadoCita = 'proxima' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  doctorNombre: string;
  doctorImagen: string;
  especialidad: string;
  calificacion: number;
  fecha: string;
  hora: string;
  duracionMin: number;
  ubicacion: string;
  estado: EstadoCita;
  precio: number;
  moneda: string;
}
