export type EstadoCita = 'proxima' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  appointmentId: number;
  providerId: number;
  doctorNombre: string;
  doctorImagen: string;
  especialidad: string;
  motivo?: string;
  calificacion: number;
  fecha: string;
  hora: string;
  duracionMin: number;
  ubicacion: string;
  modalidad: string;
  estado: EstadoCita;
  precio: number;
  moneda: string;
}

export interface AppointmentHistoryDTO {
  appointmentId: number;
  date: string;
  time: string;
  status: string;
  doctor: string;
  providerId: number;
  specialty: string;
  photoUrl: string | null;
  rating: number;
  price: number;
  durationMinutes: number;
  modality: string;
  district: string;
  notes?: string;
  reason?: string;
}
