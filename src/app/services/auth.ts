import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'cs_user';

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    // TODO: reemplazar con llamada real a tu API
    const user = { email, nombre: 'Marisol Gomez', rol: 'paciente' };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.SESSION_KEY);
  }

  getUser(): any {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
