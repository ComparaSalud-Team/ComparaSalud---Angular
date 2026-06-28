import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

import { ProviderService } from '../../services/provider.service';
import { Provider } from '../../models/provider.model';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-busqueda-medicos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './busqueda-medicos.html',
  styleUrls: ['./busqueda-medicos.css'],
})
export class BusquedaMedicosComponent implements OnInit {
  providers: Provider[] = [];
  todosLosDoctores: any[] = [];
  doctoresFiltrados: any[] = [];
  searchQuery = '';
  ordenarPor = '';
  ordenDireccion = 'asc';

  constructor(
    private providerService: ProviderService,
    private cdr: ChangeDetectorRef,
  ) {}

  sidebarFiltros = {
    ubicacion: '',
    categoria: '',
    idioma: '',
    disponibilidad: '',
    modalidad: '',
    precio: 500,
    calificacion: 0,
  };

  categoriaOptions: FilterOption[] = [
    { label: 'Todas', value: '' },
    { label: 'Cardiología', value: 'cardiología' },
    { label: 'Pediatría', value: 'pediatría' },
    { label: 'Dermatología', value: 'dermatología' },
    { label: 'Neurología', value: 'neurología' },
    { label: 'Ginecología', value: 'ginecología' },
    { label: 'Traumatología', value: 'traumatología' },
    { label: 'Oftalmología', value: 'oftalmología' },
    { label: 'Medicina General', value: 'medicina general' },
  ];

  disponibilidadOptions: FilterOption[] = [
    { label: 'Cualquiera', value: '' },
    { label: 'Esta semana', value: 'esta-semana' },
    { label: 'Este mes', value: 'este-mes' },
    { label: 'Disponible hoy', value: 'hoy' },
  ];

  modalidadOptions: FilterOption[] = [
    { label: 'Cualquiera', value: '' },
    { label: 'Online', value: 'online' },
    { label: 'Presencial', value: 'presencial' },
    { label: 'Ambos', value: 'ambos' },
  ];

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.providerService.getProviders().subscribe({
      next: (data) => {
        this.providers = data;
        this.todosLosDoctores = data.map((provider, index) => ({
          id: provider.id,
          nombre: provider.fullName,
          bandera: '🇵🇪',
          rol:
            provider.specialty +
            (provider.experienceYears ? ` | ${provider.experienceYears} años de experiencia` : ''),
          descripcion: provider.description || 'Especialista médico registrado en ComparaSalud.',
          idiomas: 'Español',
          imagen: `assets/images/doctor-card-${(index % 4) + 1}.png`,
          especialidad: (provider.specialty || '').toLowerCase(),
          tags: [{ label: provider.specialty || 'Especialidad', beige: true }],
          rating: Number(provider.averageRating) || 0,
          resenas: 0,
          pacientes: 0,
          sesiones: 0,
          reservas: 0,
          experienceYears: Number(provider.experienceYears) || 0,
          precioPuro: Number(provider.pricePerAppointment) || 0,
          precio: `S/${provider.pricePerAppointment || 0}`,
          socials: [],
        }));
        this.doctoresFiltrados = [...this.todosLosDoctores];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando providers', error);
      },
    });
  }

  buscar(): void {
    const q = this.searchQuery.toLowerCase().trim();

    this.doctoresFiltrados = this.todosLosDoctores.filter((doctor) => {
      const coincideTexto =
        !q ||
        doctor.nombre.toLowerCase().includes(q) ||
        doctor.especialidad.includes(q) ||
        doctor.descripcion.toLowerCase().includes(q);

      const coincideCategoria =
        !this.sidebarFiltros.categoria ||
        doctor.especialidad.includes(this.sidebarFiltros.categoria.toLowerCase());

      const coincidePrecio =
        doctor.precioPuro === 0 || doctor.precioPuro <= this.sidebarFiltros.precio;

      const coincideCalificacion =
        Number(doctor.rating) >= Number(this.sidebarFiltros.calificacion);

      return coincideTexto && coincideCategoria && coincidePrecio && coincideCalificacion;
    });

    if (this.ordenarPor === 'precio') {
      this.doctoresFiltrados.sort((a, b) =>
        this.ordenDireccion === 'asc' ? a.precioPuro - b.precioPuro : b.precioPuro - a.precioPuro,
      );
    } else if (this.ordenarPor === 'calificacion') {
      this.doctoresFiltrados.sort((a, b) =>
        this.ordenDireccion === 'asc' ? a.rating - b.rating : b.rating - a.rating,
      );
    } else if (this.ordenarPor === 'experiencia') {
      this.doctoresFiltrados.sort((a, b) =>
        this.ordenDireccion === 'asc'
          ? a.experienceYears - b.experienceYears
          : b.experienceYears - a.experienceYears,
      );
    }

    this.cdr.detectChanges();
  }

  aplicarFiltros(): void {
    this.buscar();
  }

  limpiarFiltros(): void {
    this.searchQuery = '';
    this.ordenarPor = '';
    this.ordenDireccion = 'asc';
    this.sidebarFiltros = {
      ubicacion: '',
      categoria: '',
      idioma: '',
      disponibilidad: '',
      modalidad: '',
      precio: 500,
      calificacion: 0,
    };
    this.doctoresFiltrados = [...this.todosLosDoctores];
    this.cdr.detectChanges();
  }

  agendarCita(doctor: any): void {
    console.log('Agendar cita:', doctor);
  }

  getRangeBackground(value: number, min: number, max: number): string {
    const pct = ((value - min) / (max - min)) * 100;
    return `linear-gradient(90deg, #8B5CF6 ${pct}%, #E2E8F0 ${pct}%)`;
  }

  getTooltipLeft(value: number, min: number, max: number): string {
    const pct = ((value - min) / (max - min)) * 100;
    return `calc(${pct}% + ${8 - pct * 0.16}px)`;
  }
}
