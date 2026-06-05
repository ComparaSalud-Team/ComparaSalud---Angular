import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css',
})
export class MisCitasComponent implements OnInit {
  user: any = null;
  tabActivo = 'todas';

  citas = [
    {
      id: 'APT-2026-001234',
      doctor: 'Dr. Armando Castillo',
      imagen: 'assets/images/doctor-card-1.png',
      especialidad: 'Medicina General',
      calificacion: 4.8,
      fecha: 'Lunes, 12 de Mayo 2026',
      hora: '10:00',
      duracion: 50,
      ubicacion: 'Clínica Ricardo Palma - San Isidro',
      estado: 'proxima',
      precio: 150,
    },
    {
      id: 'APT-2026-001199',
      doctor: 'Dra. María Fernández',
      imagen: 'assets/images/doctor-card-2.png',
      especialidad: 'Cardiología',
      calificacion: 4.9,
      fecha: 'Miércoles, 14 de Mayo 2026',
      hora: '15:30',
      duracion: 40,
      ubicacion: 'Hospital Nacional Dos de Mayo',
      estado: 'confirmada',
      precio: 200,
    },
    {
      id: 'APT-2026-001102',
      doctor: 'Dr. Carlos Mendoza',
      imagen: 'assets/images/doctor-card-3.png',
      especialidad: 'Dermatología',
      calificacion: 4.7,
      fecha: 'Viernes, 16 de Mayo 2026',
      hora: '09:00',
      duracion: 30,
      ubicacion: 'Clínica San Felipe - Jesús María',
      estado: 'confirmada',
      precio: 180,
    },
    {
      id: 'APT-2026-000987',
      doctor: 'Dr. Jorge Ramirez',
      imagen: 'assets/images/doctor-card-1.png',
      especialidad: 'Pediatría',
      calificacion: 4.6,
      fecha: 'Martes, 6 de Mayo 2026',
      hora: '11:00',
      duracion: 45,
      ubicacion: 'Clínica Anglo Americana - San Isidro',
      estado: 'completada',
      precio: 170,
    },
    {
      id: 'APT-2026-000856',
      doctor: 'Dra. Ana Torres',
      imagen: 'assets/images/doctor-card-2.png',
      especialidad: 'Oftalmología',
      calificacion: 4.8,
      fecha: 'Jueves, 1 de Mayo 2026',
      hora: '14:00',
      duracion: 35,
      ubicacion: 'Clínica Internacional - San Borja',
      estado: 'completada',
      precio: 220,
    },
    {
      id: 'APT-2026-000745',
      doctor: 'Dr. Luis Vargas',
      imagen: 'assets/images/doctor-card-3.png',
      especialidad: 'Traumatología',
      calificacion: 4.5,
      fecha: 'Lunes, 28 de Abril 2026',
      hora: '16:30',
      duracion: 50,
      ubicacion: 'Clínica San Pablo - Surco',
      estado: 'cancelada',
      precio: 0,
    },
  ];

  get citasFiltradas() {
    if (this.tabActivo === 'todas') return this.citas;
    return this.citas.filter(
      (c) =>
        c.estado === this.tabActivo || (this.tabActivo === 'proximas' && c.estado === 'proxima'),
    );
  }

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
  }

  setTab(tab: string) {
    this.tabActivo = tab;
  }

  getBadgeClass(estado: string) {
    return {
      'badge-proxima': estado === 'proxima',
      'badge-confirmada': estado === 'confirmada',
      'badge-completada': estado === 'completada',
      'badge-cancelada': estado === 'cancelada',
    };
  }

  getBadgeLabel(estado: string) {
    const labels: any = {
      proxima: 'Próxima',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return labels[estado] || estado;
  }
}
