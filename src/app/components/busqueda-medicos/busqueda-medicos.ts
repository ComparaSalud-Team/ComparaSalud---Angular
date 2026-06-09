import { Component, OnInit } from '@angular/core';
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

  doctoresFiltrados: any[] = [];

  searchQuery = '';

  constructor(private providerService: ProviderService) {}

  topFilters: { value: string; options: FilterOption[] }[] = [
    {
      value: 'medicina-general',
      options: [
        { label: 'Medicina general', value: 'medicina-general' },
        { label: 'Cardiología', value: 'cardiologia' },
        { label: 'Dermatología', value: 'dermatologia' },
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
      value: 'experiencia',
      options: [
        { label: 'Experiencia', value: 'experiencia' },
        { label: 'Calificación', value: 'calificacion' },
        { label: 'Precio', value: 'precio' },
      ],
    },
  ];

  sidebarFiltros = {
    ubicacion: '',
    categoria: 'medicina-general',
    disponibilidad: 'esta-semana',
    modalidad: 'online',
    precio: 70,
    calificacion: 70,
  };

  categoriaOptions: FilterOption[] = [
    { label: 'Medicina general', value: 'medicina-general' },
    { label: 'Cardiología', value: 'cardiologia' },
    { label: 'Dermatología', value: 'dermatologia' },
    { label: 'Pediatría', value: 'pediatria' },
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

        this.doctoresFiltrados = data.map((provider, index) => ({
          id: provider.id,
          nombre: provider.fullName,
          bandera: '🇵🇪',

          rol:
            provider.specialty +
            (provider.experienceYears ? ` | ${provider.experienceYears} años de experiencia` : ''),

          descripcion: provider.description || 'Especialista médico registrado en ComparaSalud.',

          idiomas: 'Español',

          imagen: `assets/images/doctor-card-${(index % 4) + 1}.png`,

          tags: [
            {
              label: provider.specialty || 'Especialidad',
              beige: true,
            },
          ],

          rating: provider.averageRating || 0,
          resenas: 0,
          pacientes: 0,
          sesiones: 0,
          reservas: 0,
          precio: `S/${provider.pricePerAppointment || 0}`,
          socials: [],
        }));

        console.log('Doctores transformados:', this.doctoresFiltrados);
        console.log('Cantidad:', this.doctoresFiltrados.length);
      },
      error: (error) => {
        console.error('Error cargando providers', error);
      },
    });
  }



  aplicarFiltros(): void {
    console.log('Filtros aplicados', this.sidebarFiltros);
  }

  limpiarFiltros(): void {
    this.sidebarFiltros = {
      ubicacion: '',
      categoria: 'medicina-general',
      disponibilidad: 'esta-semana',
      modalidad: 'online',
      precio: 70,
      calificacion: 70,
    };
  }

  agendarCita(doctor: any): void {
    console.log('Agendar cita:', doctor);
  }
}
