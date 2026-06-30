import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentHistoryDTO } from '../models/cita';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private apiUrl = 'http://localhost:8081/api/appointments';

  constructor(private http: HttpClient) {}

  // HU nueva (backend) – Historial de citas del paciente (COMPLETED y CANCELLED).
  // El backend solo devuelve estas dos, no hay endpoint para listar
  // citas próximas/pendientes de un paciente todavía.
  obtenerHistorial(userId: number): Observable<AppointmentHistoryDTO[]> {
    return this.http.get<AppointmentHistoryDTO[]>(`${this.apiUrl}/history`, {
      params: { userId },
    });
  }

  // HU34 – Cancelar cita
  cancelarCita(appointmentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/cancel`, {});
  }

  // HU35 – Reprogramar cita
  reprogramarCita(
    appointmentId: number,
    body: { newDate: string; newStartTime: string; newEndTime: string },
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/reschedule`, body);
  }

  // HU33 – Agendar cita
  agendarCita(body: {
    patientId: number;
    providerId: number;
    serviceName: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, body);
  }
}
