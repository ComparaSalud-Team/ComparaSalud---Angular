import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
export interface Doctor {
  id: number;
  nombre: string;
  bandera: string;
  rol: string;
  descripcion: string;
  idiomas: string;
  imagen: string;
  tags: { label: string; beige?: boolean }[];
  rating: string;
  resenas: number;
  pacientes: number;
  sesiones: number;
  reservas: number;
  precio: string;
  socials?: { tipo: 'instagram' | 'linkedin' }[];
}

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
  searchQuery = '';

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

  doctores: Doctor[] = [
    {
      id: 1,
      nombre: 'Dr. Armando Castillo',
      bandera: '🇵🇪',
      rol: 'Médico profesional',
      descripcion:
        'Especialista en cardiología intervencionista con amplia experiencia en tratamiento de enfermedades cardiovasculares.',
      idiomas: 'Español Nativo, Inglés C2, Portugués Intermedio B2',
      imagen: 'assets/images/doctor-card-1.png',
      tags: [
        { label: 'Ecocardiograma', beige: true },
        { label: 'ECG' },
        { label: 'Prueba de esfuerzo' },
      ],
      rating: '5 ★',
      resenas: 104,
      pacientes: 32,
      sesiones: 300,
      reservas: 16,
      precio: 'S/150',
      socials: [{ tipo: 'instagram' }, { tipo: 'linkedin' }],
    },
    {
      id: 2,
      nombre: 'Dra. Maura Casas',
      bandera: '🇵🇪',
      rol: 'Cardiólogo | 12 años de experiencia',
      descripcion:
        'Experta en cardiología preventiva y rehabilitación cardíaca. Miembro de la Sociedad Peruana de Cardiología.',
      idiomas: 'Español Nativo, Inglés C2, Portugués Intermedio B2',
      imagen: 'assets/images/doctor-card-2.png',
      tags: [{ label: 'Consulta preventiva', beige: true }, { label: 'Holter' }],
      rating: '4.9 ★',
      resenas: 104,
      pacientes: 32,
      sesiones: 300,
      reservas: 16,
      precio: 'S/150',
      socials: [{ tipo: 'instagram' }, { tipo: 'linkedin' }],
    },
    {
      id: 3,
      nombre: 'Dr. Mateo Rojas',
      bandera: '🇵🇪',
      rol: 'Cardiólogo profesional',
      descripcion:
        'Cardiólogo intervencionista con especialización en cateterismo cardíaco y angioplastia coronaria.',
      idiomas: 'Español Nativo, Inglés C2, Portugués Intermedio B2',
      imagen: 'assets/images/doctor-card-3.png',
      tags: [{ label: 'Cateterismo', beige: true }, { label: 'Consulta especializada' }],
      rating: '5 ★',
      resenas: 104,
      pacientes: 32,
      sesiones: 300,
      reservas: 16,
      precio: 'S/150',
    },
    {
      id: 4,
      nombre: 'Dra. Luna Yi',
      bandera: '🇵🇪',
      rol: 'Médico profesional',
      descripcion:
        'Especialista en medicina del talento y el bienestar psicológico organizacional.',
      idiomas: 'Español Nativo, Inglés C2, Portugués Intermedio B2',
      imagen: 'assets/images/doctor-card-4.png',
      tags: [
        { label: 'Gestión de clínicas organizacional', beige: true },
        { label: 'Estrategia empresarial' },
      ],
      rating: '5 ★',
      resenas: 104,
      pacientes: 32,
      sesiones: 300,
      reservas: 16,
      precio: 'S/150',
    },
  ];

  get doctoresFiltrados(): Doctor[] {
    if (!this.searchQuery.trim()) return this.doctores;
    const q = this.searchQuery.toLowerCase();
    return this.doctores.filter(
      (d) =>
        d.nombre.toLowerCase().includes(q) ||
        d.rol.toLowerCase().includes(q) ||
        d.descripcion.toLowerCase().includes(q) ||
        d.tags.some((t) => t.label.toLowerCase().includes(q)),
    );
  }

  aplicarFiltros(): void {
    console.log('Filtros aplicados:', this.sidebarFiltros);
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

  agendarCita(doctor: Doctor): void {
    console.log('Agendar cita con:', doctor.nombre);
  }

  ngOnInit(): void {}
}
