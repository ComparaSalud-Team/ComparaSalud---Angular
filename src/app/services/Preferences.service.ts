import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserPreferences } from '../models/UserPreferences';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private apiUrl = 'http://localhost:8081/api/preferences';

  constructor(private http: HttpClient) {}

  obtener(authUserId: number): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.apiUrl}/${authUserId}`);
  }

  guardar(authUserId: number, prefs: UserPreferences): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(`${this.apiUrl}/${authUserId}`, prefs);
  }

  restablecer(authUserId: number): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${this.apiUrl}/${authUserId}/reset`, {});
  }
}
