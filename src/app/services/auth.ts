import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'cs_user';
  private readonly TOKEN_KEY = 'cs_token';
  private readonly apiUrl = 'http://localhost:8081/api';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(response));
      }),
      switchMap((response: any) => {
        return this.http.get(`${this.apiUrl}/users/profile`).pipe(
          tap((profile: any) => {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify({ ...response, profile }));
          }),
          catchError((err) => {
            console.error('Profile fetch error:', err);
            return of(response);
          }),
        );
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}
