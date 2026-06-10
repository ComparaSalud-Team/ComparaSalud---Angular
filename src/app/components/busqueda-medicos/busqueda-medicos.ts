import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

import { ProviderService } from '../../services/provider.service';
import { Provider } from '../../models/provider.model';
import { min } from 'rxjs';

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
  todosLosDoctores: any[] = []; // guarda la lista completa sin filtrar
  doctoresFiltrados: any[] = [];
  searchQuery = '';

  constructor(private providerService: ProviderService) {}

  topFilters: { value: string; options: FilterOption[] }[] = [
    {
      value: '',
      options: [
        { label: 'Todas las especialidades', value: '' },
        { label: 'Medicina general', value: 'medicina general' },
        { label: 'Cardiología', value: 'cardiología' },
        { label: 'Dermatología', value: 'dermatología' },
        { label: 'Neurología', value: 'neurología' },
      ],
    },
    {
      value: 'esta-semana',
      options: [
        { label: 'Esta semana', value: 'esta-semana' },
        { label: 'Este mes', value: 'este-mes' },
        { label: 'Disponible hoy', value: 'hoy' },
      ],
    },
    {
      value: 'español',
      options: [
        { label: 'Español', value: 'español' },
        { label: 'Inglés', value: 'ingles' },
      ],
    },
    {
      value: 'online',
      options: [
        { label: 'Online', value: 'online' },
        { label: 'Presencial', value: 'presencial' },
        { label: 'Ambos', value: 'ambos' },
      ],
    },
    {
      value: '',
      options: [
        { label: 'Ordenar por', value: '' },
        { label: 'Experiencia', value: 'experiencia' },
        { label: 'Calificación', value: 'calificacion' },
        { label: 'Precio', value: 'precio' },
      ],
    },
  ];

  sidebarFiltros = {
    ubicacion: '',
    categoria: '',
    disponibilidad: 'esta-semana',
    modalidad: 'online',
    precio: 500,
    calificacion: 1,
  };

  categoriaOptions: FilterOption[] = [
    { label: 'Todas', value: '' },
    { label: 'Medicina general', value: 'medicina general' },
    { label: 'Cardiología', value: 'cardiología' },
    { label: 'Dermatología', value: 'dermatología' },
    { label: 'Pediatría', value: 'pediatría' },
    { label: 'Neurología', value: 'neurología' },
  ];

  disponibilidadOptions: FilterOption[] = [
    { label: 'Esta semana', value: 'esta-semana' },
    { label: 'Este mes', value: 'este-mes' },
    { label: 'Disponible hoy', value: 'hoy' },
  ];

  modalidadOptions: FilterOption[] = [
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
          precioPuro: Number(provider.pricePerAppointment) || 0,
          precio: `S/${provider.pricePerAppointment || 0}`,
          socials: [],
        }));
        this.doctoresFiltrados = [...this.todosLosDoctores];
      },
      error: (error) => {
        console.error('Error cargando providers', error);
      },
    });
  }

  buscar(): void {
    const q = this.searchQuery.toLowerCase().trim();
    const especialidadTop = this.topFilters[0].value.toLowerCase();

    this.doctoresFiltrados = this.todosLosDoctores.filter((doctor) => {
      // Filtro por texto de búsqueda
      const coincideTexto =
        !q ||
        doctor.nombre.toLowerCase().includes(q) ||
        doctor.especialidad.includes(q) ||
        doctor.descripcion.toLowerCase().includes(q);

      // Filtro por especialidad del top filter
      const coincideEspecialidadTop =
        !especialidadTop || doctor.especialidad.includes(especialidadTop);

      // Filtro por categoría del sidebar
      const coincideCategoria =
        !this.sidebarFiltros.categoria ||
        doctor.especialidad.includes(this.sidebarFiltros.categoria.toLowerCase());

      // Filtro por precio
      const coincidePrecio = doctor.precioPuro <= this.sidebarFiltros.precio;

      // Filtro por calificación
      const coincideCalificacion = Number(doctor.rating) >= Number(this.sidebarFiltros.calificacion);

      return (
        coincideTexto &&
        coincideEspecialidadTop &&
        coincideCategoria &&
        coincidePrecio &&
        coincideCalificacion
      );
    });
  }

  aplicarFiltros(): void {
    console.log('Calificacion filtro:', this.sidebarFiltros.calificacion);
    console.log(
      'Ratings doctores:',
      this.todosLosDoctores.map((d) => d.rating),
    );
    this.buscar();
  }

  limpiarFiltros(): void {
    this.searchQuery = '';
    this.sidebarFiltros = {
      ubicacion: '',
      categoria: '',
      disponibilidad: 'esta-semana',
      modalidad: 'online',
      precio: 500,
      calificacion: 1,
    };
    this.topFilters[0].value = '';
    this.doctoresFiltrados = [...this.todosLosDoctores];
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
