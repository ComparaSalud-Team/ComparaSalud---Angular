import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NavbarProveedorComponent } from '../../../shared/public-navbar-proveedor/public-navbar';
import { SidebarProveedorComponent } from '../../../shared/sidebar-proveedor/sidebar-proveedor';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';

interface CitaResumen {
  paciente: string;
  iniciales: string;
  hora: string;
  motivo: string;
  estado: 'Confirmada' | 'Pendiente';
}

interface DisponibilidadSlot {
  rango: string;
  estado: 'Ocupado' | 'Disponible';
}

interface Resena {
  paciente: string;
  iniciales: string;
  hace: string;
  estrellas: number;
  comentario: string;
}

@Component({
  selector: 'app-dashboard-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarProveedorComponent,
    SidebarProveedorComponent,
    PublicFooterComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;

  citasProgramadas = 12;
  ingresos = 6450;
  pacientesUnicos = 28;
  calificacionPromedio = 4.8;

  proximasCitas: CitaResumen[] = [
    {
      paciente: 'María González',
      iniciales: 'MG',
      hora: '09:00 AM',
      motivo: 'Consulta',
      estado: 'Confirmada',
    },
    {
      paciente: 'José Ramírez',
      iniciales: 'JR',
      hora: '10:30 AM',
      motivo: 'Control',
      estado: 'Pendiente',
    },
    {
      paciente: 'Ana Castro',
      iniciales: 'AC',
      hora: '02:00 PM',
      motivo: 'Videoconsulta',
      estado: 'Confirmada',
    },
    {
      paciente: 'Carlos Mendoza',
      iniciales: 'CM',
      hora: '04:30 PM',
      motivo: 'Consulta',
      estado: 'Confirmada',
    },
  ];

  disponibilidadHoy: DisponibilidadSlot[] = [
    { rango: '09:00 - 09:30', estado: 'Ocupado' },
    { rango: '09:30 - 10:00', estado: 'Disponible' },
    { rango: '10:00 - 10:30', estado: 'Ocupado' },
    { rango: '10:30 - 11:00', estado: 'Disponible' },
    { rango: '14:00 - 14:30', estado: 'Ocupado' },
    { rango: '14:30 - 15:00', estado: 'Disponible' },
  ];

  desempeno = {
    asistencia: 92,
    completadas: 87,
    tiempoPromedio: 32,
    canceladas: 8,
  };

  ingresosSemana = [
    { dia: 'Lun', valor: 30 },
    { dia: 'Mar', valor: 55 },
    { dia: 'Mié', valor: 40 },
    { dia: 'Jue', valor: 65 },
    { dia: 'Vie', valor: 50 },
    { dia: 'Sáb', valor: 75 },
    { dia: 'Dom', valor: 90 },
  ];

  resenas: Resena[] = [
    {
      paciente: 'Patricia López',
      iniciales: 'PL',
      hace: 'Hace 2 horas',
      estrellas: 5,
      comentario: 'Excelente atención y muy profesional. Recomendado al 100%.',
    },
    {
      paciente: 'Roberto Silva',
      iniciales: 'RS',
      hace: 'Hace 1 día',
      estrellas: 5,
      comentario: 'Muy buen doctor, explica todo con mucha paciencia.',
    },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
  }

  get displayName(): string {
    return this.user?.name || this.user?.fullName || this.user?.email || 'Usuario';
  }

  get chartPoints(): string {
    const width = 600;
    const height = 140;
    const max = Math.max(...this.ingresosSemana.map((d) => d.valor));
    const step = width / (this.ingresosSemana.length - 1);

    return this.ingresosSemana
      .map((d, i) => {
        const x = i * step;
        const y = height - (d.valor / max) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }

  get chartAreaPath(): string {
    const width = 600;
    const height = 140;
    return `M0,${height} L${this.chartPoints} L${width},${height} Z`;
  }
}
