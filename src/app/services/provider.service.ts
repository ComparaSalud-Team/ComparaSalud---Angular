import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider } from '../models/provider.model';

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
  registerProvider(provider: any): Observable<any> {
    return this.http.post(this.registerUrl, provider);
  }
}
