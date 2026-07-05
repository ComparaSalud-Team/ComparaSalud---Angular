import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  showPassword = false;

  private returnUrl = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }

        const role = (this.auth.getRole() || '').toString().toUpperCase();

        if (role === 'PROVIDER') {
          this.router.navigateByUrl('/dashboard/proveedor');
        } else {
          this.router.navigateByUrl('/dashboard/paciente');
        }
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        alert('Correo o contraseña incorrectos');
      },
    });
  }
}
