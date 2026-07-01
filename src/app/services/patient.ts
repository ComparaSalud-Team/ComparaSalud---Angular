import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/users/profile`);
  }

  updatePatient(id: number, data: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}`, data);
  }
}
