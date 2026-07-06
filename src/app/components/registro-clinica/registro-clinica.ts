import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClinicService } from '../../services/clinic.service';

@Component({
  selector: 'app-registro-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-clinica.html',
  styleUrl: './registro-clinica.css',
})
export class RegistroClinicaComponent {
  nombreClinica = '';
  ruc = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  aceptaTerminos = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private clinicService: ClinicService,
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }

  onRucInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '').slice(0, 11);
    this.ruc = soloNumeros;
    input.value = soloNumeros;
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

  onSubmit(): void {
    this.errorMsg = '';

    if (!this.nombreClinica || !this.ruc || !this.email || !this.password) {
      this.errorMsg = 'Completa todos los campos.';
      return;
    }
    if (this.ruc.length !== 11) {
      this.errorMsg = 'El RUC debe tener 11 dígitos.';
      return;
    }
    if (!this.passwordEsValida) {
      this.errorMsg =
        'La contraseña debe tener mínimo 8 caracteres, una letra mayúscula y un carácter especial.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }
    if (!this.aceptaTerminos) {
      this.errorMsg = 'Debes aceptar los términos y condiciones.';
      return;
    }

    const body = {
      email: this.email,
      password: this.password,
      name: this.nombreClinica,
      ruc: this.ruc,
    };

    this.clinicService.registerClinic(body).subscribe({
      next: () => {
        alert('Clínica registrada correctamente');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMsg = error?.error?.message || 'Error al registrar la clínica.';
      },
    });
  }
}
