import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clinic } from '../models/clinic';
import { Provider } from '../models/provider.model';
import { ClinicSpecialtyPrice } from '../models/clinic-specialty-price';
import { ClinicDashboardDTO } from '../models/clinic-dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class ClinicService {
  private apiUrl = 'http://localhost:8081/api/clinics';
  private registerUrl = 'http://localhost:8081/api/auth/register/clinic';

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

  preciosDeClinica(id: number): Observable<ClinicSpecialtyPrice[]> {
    return this.http.get<ClinicSpecialtyPrice[]>(`${this.apiUrl}/${id}/pricing`);
  }

  compararPrecios(): Observable<ClinicSpecialtyPrice[]> {
    return this.http.get<ClinicSpecialtyPrice[]>(`${this.apiUrl}/pricing`);
  }

  getDashboard(id: number): Observable<ClinicDashboardDTO> {
    return this.http.get<ClinicDashboardDTO>(`${this.apiUrl}/${id}/dashboard`);
  }

  registerClinic(clinic: any): Observable<any> {
    return this.http.post(this.registerUrl, clinic);
  }

  actualizar(id: number, clinic: any): Observable<Clinic> {
    return this.http.put<Clinic>(`${this.apiUrl}/${id}`, clinic);
  }
}
