import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider } from '../models/provider.model';
import { Availability } from '../models/availability';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private apiUrl = 'http://localhost:8081/api/providers';
  private registerUrl = 'http://localhost:8081/api/auth/register/provider';

  constructor(private http: HttpClient) {}

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.apiUrl);
  }

  getById(id: number): Observable<Provider> {
    return this.http.get<Provider>(`${this.apiUrl}/${id}`);
  }

  getAvailability(id: number, date: string): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/${id}/availability`, {
      params: { date },
    });
  }

  filtrarPorDisponibilidad(period: string): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.apiUrl}/filter/availability`, {
      params: { period },
    });
  }

  registerProvider(provider: any): Observable<any> {
    return this.http.post(this.registerUrl, provider);
  }
}
