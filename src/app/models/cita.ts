export type EstadoCita = 'proxima' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  appointmentId: number;
  providerId: number;
  doctorNombre: string;
  doctorImagen: string;
  especialidad: string;
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

// Refleja el AppointmentHistoryDTO que devuelve el backend
// (GET /api/appointments/history?userId=..., /api/appointments/upcoming?userId=...
// y GET /api/appointments/{id}). Los datos de proveedor (especialidad,
// rating, precio, duración, modalidad, foto) vienen embebidos para no tener
// que pedir /providers/{id} aparte.
export interface AppointmentHistoryDTO {
  appointmentId: number;
  date: string;
  time: string;
  status: string; // 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  doctor: string;
  providerId: number;
  specialty: string;
  photoUrl: string | null;
  rating: number;
  price: number;
  durationMinutes: number;
  modality: string;
  district: string;
}
