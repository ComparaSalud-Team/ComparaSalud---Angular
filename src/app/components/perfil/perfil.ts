import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';
import { AuthService } from '../../services/auth';

interface StatItem {
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  label: string;
  count: number;
  link: string;
  linkText: string;
}

interface InfoRow {
  label: string;
  value: string;
}

interface InfoCard {
  iconClass: string;
  iconColor: 'blue' | 'red' | 'green';
  title: string;
  rows: InfoRow[];
  showEmergencyBtn?: boolean;
}

interface Cita {
  day: string;
  month: string;
  doctor: string;
  especialidad: string;
  hora: string;
  lugar: string;
}

interface HistorialItem {
  title: string;
  count: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  usuario = {
    nombre: '',
    subtitulo: '',
    email: '',
    telefono: '',
    ubicacion: '',
    tags: [] as string[],
    avatar: '',
  };

  stats: StatItem[] = [
    {
      icon: 'fa-regular fa-calendar-check',
      color: 'blue',
      label: 'Próximas citas',
      count: 2,
      link: '/mis-citas',
      linkText: 'Ver citas',
    },
    {
      icon: 'fa-solid fa-circle-check',
      color: 'green',
      label: 'Citas realizadas',
      count: 12,
      link: '/mis-citas',
      linkText: 'Ver historial',
    },
    {
      icon: 'fa-regular fa-heart',
      color: 'purple',
      label: 'Médicos favoritos',
      count: 5,
      link: '/favoritos',
      linkText: 'Ver favoritos',
    },
    {
      icon: 'fa-regular fa-file',
      color: 'orange',
      label: 'Documentos',
      count: 8,
      link: '/documentos',
      linkText: 'Ver documentos',
    },
  ];

  infoCards: InfoCard[] = [
    {
      iconClass: 'fa-regular fa-user',
      iconColor: 'blue',
      title: 'Información personal',
      rows: [
        { label: 'Fecha de nacimiento', value: '—' },
        { label: 'DNI', value: '—' },
        { label: 'Estado civil', value: '—' },
        { label: 'Profesión', value: '—' },
        { label: 'Idioma preferido', value: 'Español' },
        { label: 'Dirección', value: '—' },
      ],
    },
    {
      iconClass: 'fa-regular fa-heart',
      iconColor: 'red',
      title: 'Información médica',
      rows: [
        { label: 'Tipo de sangre', value: '—' },
        { label: 'Alergias', value: '—' },
        { label: 'Condiciones médicas', value: '—' },
        { label: 'Medicamentos actuales', value: '—' },
        { label: 'Seguro médico', value: '—' },
      ],
    },
    {
      iconClass: 'fa-solid fa-phone',
      iconColor: 'green',
      title: 'Contacto de emergencia',
      rows: [
        { label: 'Nombre', value: '—' },
        { label: 'Parentesco', value: '—' },
        { label: 'Teléfono', value: '—' },
        { label: 'Dirección', value: '—' },
      ],
      showEmergencyBtn: true,
    },
  ];

  citas: Cita[] = [
    {
      day: '20',
      month: 'MAY',
      doctor: 'Dr. Carlos Méndez',
      especialidad: 'Cardiología',
      hora: '10:30 am',
      lugar: 'Clínica Ricardo Palma',
    },
    {
      day: '05',
      month: 'JUN',
      doctor: 'Dra. Ana Torres',
      especialidad: 'Dermatología',
      hora: '9:00 am',
      lugar: 'Clínica San Felipe',
    },
  ];

  historial: HistorialItem[] = [
    { title: 'Resultados de análisis', count: 8 },
    { title: 'Recetas médicas', count: 5 },
    { title: 'Informes médicos', count: 12 },
    { title: 'Estudios e imágenes', count: 3 },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const session = this.auth.getUser();
    const profile = session?.profile || session;

    this.usuario = {
      nombre: profile?.name || 'Usuario',
      subtitulo: 'Paciente activo en ComparaSalud.',
      email: profile?.email || '—',
      telefono: profile?.phone || '—',
      ubicacion: profile?.country || '—',
      tags: ['—'],
      avatar:
        profile?.photoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=0EA5E9&color=fff&size=128`,
    };

    this.infoCards[0].rows[5].value = profile?.country || '—';
  }
}
