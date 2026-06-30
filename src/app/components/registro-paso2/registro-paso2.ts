import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro-paso2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-paso2.html',
  styleUrl: './registro-paso2.css',
})
export class RegistroPaso2Component {
  nombre = '';
  telefono = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  aceptaTerminos = false;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  onSubmit() {
    if (!this.nombre || !this.email || !this.password) {
      alert('Completa todos los campos');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!this.aceptaTerminos) {
      alert('Debes aceptar los términos');
      return;
    }

    const body = {
      email: this.email,
      password: this.password,
      name: this.nombre,
      phone: this.telefono,
      birthday: '',
      country: 'Perú',
    };

    this.http.post('http://localhost:8081/api/auth/register/patient', body).subscribe({
      next: () => {
        alert('Cuenta creada correctamente');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear cuenta: ' + JSON.stringify(err.error));
      },
    });
  }
}
