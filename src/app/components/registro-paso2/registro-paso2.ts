import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro-paso2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-paso2.html',
  styleUrl: './registro-paso2.css',
})
export class RegistroPaso2Component {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  aceptaTerminos = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) return;
    this.auth.login(this.email, this.password);
    this.router.navigate(['/dashboard']);
  }
}
