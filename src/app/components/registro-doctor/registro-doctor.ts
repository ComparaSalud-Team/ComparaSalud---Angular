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

  // Clínicas disponibles para elegir (un doctor puede atender en varias)
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

  onSubmit(): void {
    this.errorMsg = '';

    if (!this.nombre || !this.email || !this.password || !this.especialidad) {
      this.errorMsg = 'Completa todos los campos obligatorios.';
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

    console.log('Enviando al backend:', doctor);

    this.providerService.registerProvider(doctor).subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
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
