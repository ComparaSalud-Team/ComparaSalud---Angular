import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clinic } from '../models/clinic';
import { Provider } from '../models/provider.model';
import { ClinicSpecialtyPrice } from '../models/clinic-specialty-price';

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

  // Comparador de proveedores – precios por especialidad de una clínica
  preciosDeClinica(id: number): Observable<ClinicSpecialtyPrice[]> {
    return this.http.get<ClinicSpecialtyPrice[]>(`${this.apiUrl}/${id}/pricing`);
  }

  // Comparador de precios – precios por especialidad de todas las clínicas activas
  compararPrecios(): Observable<ClinicSpecialtyPrice[]> {
    return this.http.get<ClinicSpecialtyPrice[]>(`${this.apiUrl}/pricing`);
  }
}
