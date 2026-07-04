import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

import { ProviderService } from '../../services/provider.service';
import { Provider } from '../../models/provider.model';
import { BusquedaHistorialService } from '../../services/busqueda-historial.service';

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
  ubicacionesDisponibles: string[] = [];
  searchQuery = '';
  ordenarPor = '';
  ordenDireccion = 'asc';
  idsDisponibles: Set<number> | null = null;

  constructor(
    private providerService: ProviderService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private historialService: BusquedaHistorialService,
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
    const especialidad = this.route.snapshot.queryParamMap.get('especialidad');
    const ubicacion = this.route.snapshot.queryParamMap.get('ubicacion');
    const fecha = this.route.snapshot.queryParamMap.get('fecha');

    if (especialidad) {
      this.sidebarFiltros.categoria = especialidad.toLowerCase();
    }
    if (ubicacion) {
      this.sidebarFiltros.ubicacion = ubicacion;
    }
    if (fecha) {
      // El backend solo filtra disponibilidad por 'hoy' / 'esta-semana' / 'este-mes',
      // no por fecha exacta, así que la fecha elegida se traduce al balde más cercano.
      this.sidebarFiltros.disponibilidad = this.mapearFechaADisponibilidad(fecha);
    }

    this.cargarProveedores();
  }

  private mapearFechaADisponibilidad(fecha: string): string {
    const seleccionada = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diffDias = Math.round((seleccionada.getTime() - hoy.getTime()) / 86400000);

    if (diffDias <= 0) return 'hoy';
    if (diffDias <= 7) return 'esta-semana';
    if (diffDias <= 31) return 'este-mes';
    return ''; // fuera de lo que el backend soporta; no filtramos por fecha en ese caso
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
          idiomas: provider.language || 'Español',
          modalidad: (provider.modality || 'presencial').toLowerCase(),
          imagen: `assets/images/doctor-card-${(index % 4) + 1}.png`,
          especialidad: (provider.specialty || '').toLowerCase(),
          distrito: provider.district || '',
          ubicacion: (provider.district || '').toLowerCase(),
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
        this.ubicacionesDisponibles = Array.from(
          new Set(data.map((p) => p.district).filter((d): d is string => !!d)),
        );

        if (this.sidebarFiltros.categoria || this.sidebarFiltros.ubicacion || this.sidebarFiltros.disponibilidad) {
          // aplicarFiltros() ya se encarga de resolver disponibilidad contra el backend,
          // aplicar buscar() y registrar la búsqueda en el historial.
          this.aplicarFiltros();
        } else {
          this.cdr.detectChanges();
        }
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

      const normalizar = (s: string) =>
        (s || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const coincideIdioma =
        !this.sidebarFiltros.idioma ||
        normalizar(doctor.idiomas) === normalizar(this.sidebarFiltros.idioma);

      const coincideModalidad =
        !this.sidebarFiltros.modalidad ||
        doctor.modalidad === this.sidebarFiltros.modalidad.toLowerCase();

      const coincideUbicacion =
        !this.sidebarFiltros.ubicacion ||
        doctor.ubicacion.includes(this.sidebarFiltros.ubicacion.toLowerCase());

      const coincideDisponibilidad =
        !this.sidebarFiltros.disponibilidad ||
        !this.idsDisponibles ||
        this.idsDisponibles.has(doctor.id);

      return (
        coincideTexto &&
        coincideCategoria &&
        coincidePrecio &&
        coincideCalificacion &&
        coincideIdioma &&
        coincideModalidad &&
        coincideUbicacion &&
        coincideDisponibilidad
      );
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
    this.registrarBusquedaEnHistorial();

    if (this.sidebarFiltros.disponibilidad) {
      this.providerService.filtrarPorDisponibilidad(this.sidebarFiltros.disponibilidad).subscribe({
        next: (providers) => {
          this.idsDisponibles = new Set(providers.map((p) => p.id));
          this.buscar();
        },
        error: (error) => {
          console.error('Error filtrando por disponibilidad', error);
          this.idsDisponibles = new Set();
          this.buscar();
        },
      });
    } else {
      this.idsDisponibles = null;
      this.buscar();
    }
  }

  private registrarBusquedaEnHistorial(): void {
    // No guardamos búsquedas "vacías" (página recién cargada sin ningún criterio).
    const tieneCriterio =
      this.searchQuery.trim() ||
      this.sidebarFiltros.categoria ||
      this.sidebarFiltros.ubicacion ||
      this.sidebarFiltros.idioma ||
      this.sidebarFiltros.modalidad ||
      this.sidebarFiltros.disponibilidad ||
      this.sidebarFiltros.calificacion > 0;

    if (!tieneCriterio) return;

    this.historialService
      .guardarBusqueda({
        keyword: this.searchQuery.trim() || this.sidebarFiltros.categoria || 'Búsqueda general',
        specialty: this.sidebarFiltros.categoria || undefined,
        district: this.sidebarFiltros.ubicacion || undefined,
        maxPrice: this.sidebarFiltros.precio,
        rating: this.sidebarFiltros.calificacion || undefined,
      })
      .subscribe({
        error: (error) => console.error('No se pudo registrar la búsqueda en el historial', error),
      });
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
    this.idsDisponibles = null;
    this.cdr.detectChanges();
  }

  agendarCita(doctor: any): void {
    console.log('Agendar cita:', doctor);
  }

  getModalidadLabel(modalidad: string): string {
    const labels: Record<string, string> = {
      presencial: 'Atención presencial',
      online: 'Atención virtual',
      ambos: 'Presencial y virtual',
    };
    return labels[modalidad] || 'Atención presencial';
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
