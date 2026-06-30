import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProviderService } from '../../services/provider.service';

@Component({
  selector: 'app-registro-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-doctor.html',
  styleUrl: './registro-doctor.css',
})
export class RegistroDoctorComponent {
  nombre = '';
  email = '';
  password = '';

  especialidad = '';
  modalidad = 'Presencial';
  clinica = '';

  telefono = '';
  experiencia = 0;
  idioma = 'Español';
  distrito = '';
  ciudad = '';

  descripcion = '';

  aceptaTerminos = false;

  showPassword = false;

  constructor(
    private router: Router,
    private providerService: ProviderService,
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.nombre || !this.email || !this.password || !this.especialidad) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    if (!this.aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    const modalidadMap: Record<string, string> = {
      Presencial: 'presencial',
      Virtual: 'online',
      Híbrida: 'ambos',
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
      modality: modalidadMap[this.modalidad] || 'presencial',

      district: this.distrito,
      city: this.ciudad,

      // Campos requeridos por el backend
      street: this.clinica,
      country: 'Perú',
      pricePerAppointment: 0,
    };

    console.log('Enviando al backend:', doctor);

    this.providerService.registerProvider(doctor).subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
        alert('Doctor registrado correctamente');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al registrar doctor');
      },
    });
  }
}
