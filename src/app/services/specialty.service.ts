import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Specialty } from '../models/specialty';

@Injectable({
  providedIn: 'root',
})
export class SpecialtyService {
  private apiUrl = 'http://localhost:8081/api/specialties';

  constructor(private http: HttpClient) {}

  listarActivas(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${this.apiUrl}/active`);
  }
}
