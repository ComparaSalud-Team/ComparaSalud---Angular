import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro-paso2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-paso2.html',
  styleUrl: './registro-paso2.css',
})
export class RegistroPaso2Component implements OnInit {
  nombre = '';
  telefono = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  aceptaTerminos = false;

  // Si el paciente venía de intentar agendar una cita como invitado, esto
  // trae la ruta a la que debe volver una vez que inicie sesión.
  private returnUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
  }

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
        this.router.navigate(['/login'], {
          queryParams: this.returnUrl ? { returnUrl: this.returnUrl } : {},
        });
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear cuenta: ' + JSON.stringify(err.error));
      },
    });
  }
}
