import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clinic } from '../models/clinic';
import { Provider } from '../models/provider.model';

@Injectable({
  providedIn: 'root',
})
export class ClinicService {
  private apiUrl = 'http://localhost:8081/api/clinics';

  constructor(private http: HttpClient) {}

  buscarPorId(id: number): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.apiUrl}/${id}`);
  }

  listarActivas(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(`${this.apiUrl}/active`);
  }

  verProveedores(id: number): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.apiUrl}/${id}/providers`);
  }
}
