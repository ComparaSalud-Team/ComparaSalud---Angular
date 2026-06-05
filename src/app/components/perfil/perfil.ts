import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

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
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  usuario = {
    nombre: 'Marisol Gomez Sánchez',
    subtitulo:
      'Paciente activa desde marzo 2024. Seguimiento constante de citas y documentos médicos.',
    email: 'Marisol.Gomez@example.com',
    telefono: '+51 999 555 777',
    ubicacion: 'Lima, Perú',
    tags: ['Femenino', '0+', '38 años'],
    avatar: 'assets/images/profile-user.png',
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
        { label: 'Fecha de nacimiento', value: '15 de agosto de 1998' },
        { label: 'DNI', value: '75311243' },
        { label: 'Estado civil', value: 'Soltera' },
        { label: 'Profesión', value: 'Diseñadora gráfica' },
        { label: 'Idioma preferido', value: 'Español' },
        { label: 'Dirección', value: 'Av. Javier Prado 1234, Miraflores' },
      ],
    },
    {
      iconClass: 'fa-regular fa-heart',
      iconColor: 'red',
      title: 'Información médica',
      rows: [
        { label: 'Tipo de sangre', value: '0+' },
        { label: 'Alergias', value: 'Penicilina, Polen, Aínes' },
        { label: 'Condiciones médicas', value: 'Asma leve' },
        { label: 'Medicamentos actuales', value: 'Salbutamol (inhalador)' },
        { label: 'Seguro médico', value: 'Rímac salud (Plan clásico)' },
      ],
    },
    {
      iconClass: 'fa-solid fa-phone',
      iconColor: 'green',
      title: 'Contacto de emergencia',
      rows: [
        { label: 'Nombre', value: 'Carlos Goméz' },
        { label: 'Parentesco', value: 'Padre' },
        { label: 'Teléfono', value: '+51 923 123 432' },
        { label: 'Dirección', value: 'Lima, Perú' },
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

  ngOnInit(): void {}
}
