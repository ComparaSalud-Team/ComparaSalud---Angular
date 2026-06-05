import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.auth.login(this.email, this.password)) {
      this.router.navigate(['/dashboard']);
    }
  }
}
