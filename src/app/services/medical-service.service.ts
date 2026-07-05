import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalService } from '../models/medical-service.model';

@Injectable({
  providedIn: 'root',
})
export class MedicalServiceApiService {
  private apiUrl = 'http://localhost:8081/api/services';

  constructor(private http: HttpClient) {}

  // "Servicios más solicitados" del dashboard – catálogo completo de servicios activos.
  listarActivos(): Observable<MedicalService[]> {
    return this.http.get<MedicalService[]>(`${this.apiUrl}/active`);
  }
}
