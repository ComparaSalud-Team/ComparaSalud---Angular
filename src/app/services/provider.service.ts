import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider } from '../models/provider.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private apiUrl = 'http://localhost:8081/api/providers';

  constructor(private http: HttpClient) {}

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.apiUrl);
  }
  getAvailability(providerId: number, date: string): Observable<{ date: string; startTime: string; endTime: string; isAvailable: boolean }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${providerId}/availability?date=${date}`);
  }
  crearAppointment(body: any): Observable<any> {
    return this.http.post('http://localhost:8081/api/appointments', body);
  }

}
