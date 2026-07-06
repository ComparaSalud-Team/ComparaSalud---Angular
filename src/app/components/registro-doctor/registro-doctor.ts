import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { ClinicService } from '../../services/clinic.service';
import { Clinic } from '../../models/clinic';

@Component({
  selector: 'app-registro-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-doctor.html',
  styleUrl: './registro-doctor.css',
})
export class RegistroDoctorComponent implements OnInit {
  nombre = '';
  email = '';
  password = '';

  especialidad = '';
  modalidad = 'Presencial';

  telefono = '';
  experiencia = 0;
  idioma = 'Español';
  distrito = '';
  ciudad = '';

  descripcion = '';

  aceptaTerminos = false;

  showPassword = false;

  clinicasDisponibles: Clinic[] = [];
  clinicasSeleccionadas: number[] = [];
  cargandoClinicas = true;
  errorMsg = '';

  constructor(
    private router: Router,
    private providerService: ProviderService,
    private clinicService: ClinicService,
  ) {}

  ngOnInit(): void {
    this.clinicService.listarActivas().subscribe({
      next: (clinicas) => {
        this.clinicasDisponibles = clinicas;
        this.cargandoClinicas = false;
      },
      error: (err) => {
        console.error('Error cargando clínicas', err);
        this.cargandoClinicas = false;
      },
    });
  }

  toggleClinica(id: number): void {
    const idx = this.clinicasSeleccionadas.indexOf(id);
    if (idx === -1) {
      this.clinicasSeleccionadas.push(id);
    } else {
      this.clinicasSeleccionadas.splice(idx, 1);
    }
  }

  clinicaEstaSeleccionada(id: number): boolean {
    return this.clinicasSeleccionadas.includes(id);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onTelefonoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '').slice(0, 9);
    this.telefono = soloNumeros;
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

  onSubmit(): void {
    this.errorMsg = '';

    if (!this.nombre || !this.email || !this.password || !this.especialidad) {
      this.errorMsg = 'Completa todos los campos obligatorios.';
      return;
    }

    if (!this.passwordEsValida) {
      this.errorMsg =
        'La contraseña debe tener mínimo 8 caracteres, una letra mayúscula y un carácter especial.';
      return;
    }

    if (this.telefono && this.telefono.length !== 9) {
      this.errorMsg = 'El teléfono debe tener 9 dígitos.';
      return;
    }

    if (!this.aceptaTerminos) {
      this.errorMsg = 'Debes aceptar los términos y condiciones.';
      return;
    }

    if (!this.clinicasSeleccionadas.length) {
      this.errorMsg = 'Debes seleccionar al menos una clínica donde atiendes.';
      return;
    }

    const modalidadMap: Record<string, string> = {
      Presencial: 'Presencial',
      Virtual: 'Virtual',
      Híbrida: 'Híbrida',
    };

    const doctor = {
      email: this.email,
      password: this.password,
      name: this.nombre,
      phone: this.telefono,
      specialty: this.especialidad,
      description: this.descripcion,

      experienceYears: this.experiencia,
      language: this.idioma,
      modality: modalidadMap[this.modalidad] || 'Presencial',

      district: this.distrito,
      city: this.ciudad,
      country: 'Perú',
      pricePerAppointment: 0,

      clinicIds: this.clinicasSeleccionadas,
    };

    this.providerService.registerProvider(doctor).subscribe({
      next: () => {
        alert('Doctor registrado correctamente');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMsg = error?.error?.message || 'Error al registrar doctor.';
      },
    });
  }
}
