import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusquedaHistorial } from '../models/busqueda-historial';

@Injectable({
  providedIn: 'root',
})
export class BusquedaHistorialService {
  private apiUrl = 'http://localhost:8081/api/search-history';

  constructor(private http: HttpClient) {}

  // HU22 – Ya existe en el backend
  obtenerHistorial(): Observable<BusquedaHistorial[]> {
    return this.http.get<BusquedaHistorial[]>(this.apiUrl);
  }

  guardarBusqueda(payload: Partial<BusquedaHistorial>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, payload);
  }

  // --- Requiere los endpoints nuevos descritos en busqueda-historial.ts ---

  obtenerGuardados(): Observable<BusquedaHistorial[]> {
    return this.http.get<BusquedaHistorial[]>(`${this.apiUrl}/saved`);
  }

  marcarComoGuardada(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/save`, {});
  }

  quitarDeGuardados(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}/save`);
  }
}
