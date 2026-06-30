export type EstadoCita = 'proxima' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  appointmentId: number;
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

// Refleja exactamente el AppointmentHistoryDTO que devuelve el backend
// (GET /api/appointments/history?userId=...). No inventar campos que el
// backend no devuelve (especialidad, ubicación, precio, calificación):
// si se necesitan a futuro, hay que agregarlos primero en el backend.
export interface AppointmentHistoryDTO {
  appointmentId: number;
  date: string;
  time: string;
  status: string; // 'COMPLETED' | 'CANCELLED' (y potencialmente otros a futuro)
  doctor: string;
}
