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

  get tieneLongitudMinima(): boolean {
    return this.password.length >= 8;
  }

  get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get tieneCaracterEspecial(): boolean {
    return /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'~`]/.test(this.password);
  }

  get criteriosCumplidos(): number {
    return [this.tieneLongitudMinima, this.tieneMayuscula, this.tieneCaracterEspecial].filter(
      Boolean,
    ).length;
  }

  get passwordEsValida(): boolean {
    return this.criteriosCumplidos === 3;
  }

  get strengthPercent(): number {
    if (!this.password) return 0;
    return (this.criteriosCumplidos / 3) * 100;
  }

  get strengthLabel(): string {
    if (!this.password) return '';
    if (this.passwordEsValida) return 'Fuerte';
    if (this.criteriosCumplidos === 2) return 'Media';
    return 'Débil';
  }

  get strengthClass(): string {
    if (!this.password) return '';
    return this.passwordEsValida ? 'strength-ok' : 'strength-bad';
  }

  get confirmCoincide(): boolean {
    return this.confirmPassword.length > 0 && this.confirmPassword === this.password;
  }
  onTelefonoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '').slice(0, 9);
    this.telefono = soloNumeros;
    input.value = soloNumeros;
  }
  onSubmit() {
    if (!this.nombre || !this.email || !this.password) {
      alert('Completa todos los campos');
      return;
    }
    if (this.telefono && this.telefono.length !== 9) {
      alert('El teléfono debe tener 9 dígitos');
      return;
    }
    if (!this.passwordEsValida) {
      alert(
        'La contraseña debe tener mínimo 8 caracteres, una letra mayúscula y un carácter especial',
      );
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
