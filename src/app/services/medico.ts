import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider, ProviderMedicalService } from '../models/provider.model';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<Provider> {
    return this.http.get<Provider>(`${this.apiUrl}/users/profile`);
  }

  updateProvider(id: number, data: Partial<Provider>): Observable<Provider> {
    return this.http.put<Provider>(`${this.apiUrl}/providers/${id}`, data);
  }

  updateProviderServices(id: number, serviceIds: number[]): Observable<Provider> {
    return this.http.put<Provider>(`${this.apiUrl}/providers/${id}/services`, serviceIds);
  }

  getCatalogoServicios(): Observable<ProviderMedicalService[]> {
    return this.http.get<ProviderMedicalService[]>(`${this.apiUrl}/services/active`);
  }
}
