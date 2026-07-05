import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PatientService } from '../../../services/patient';
import { Patient } from '../../../models/patient.model';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { PublicNavbarComponent } from '../../../shared/public-navbar-paciente/public-navbar';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';
import { AuthService } from '../../../services/auth';
import { CitasService } from '../../../services/citas';
import { AppointmentHistoryDTO } from '../../../models/cita';

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
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, PublicNavbarComponent, PublicFooterComponent],
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

  citas: Cita[] = [];
  cargandoCitas = true;

  historial: HistorialItem[] = [
    { title: 'Resultados de análisis', count: 8 },
    { title: 'Recetas médicas', count: 5 },
    { title: 'Informes médicos', count: 12 },
    { title: 'Estudios e imágenes', count: 3 },
  ];

  constructor(
    private auth: AuthService,
    private patientService: PatientService,
    private citasService: CitasService,
    private cdr: ChangeDetectorRef,
  ) {}

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

    this.patientService.getMyProfile().subscribe({
      next: (data: Patient) => {
        this.usuario.nombre = data.name || this.usuario.nombre;
        this.usuario.email = data.email || this.usuario.email;
        this.usuario.telefono = data.phone || this.usuario.telefono;
        this.usuario.ubicacion = data.country || this.usuario.ubicacion;

        this.infoCards[0].rows[0].value = data.birthday || '—';
        this.infoCards[0].rows[1].value = data.dni || '—';
        this.infoCards[0].rows[2].value = data.estadoCivil || '—';
        this.infoCards[0].rows[3].value = data.profesion || '—';
        this.infoCards[0].rows[4].value = data.idiomaPreferido || '—';
        this.infoCards[0].rows[5].value = data.direccion || data.country || '—';

        this.infoCards[1].rows[0].value = data.tipoSangre || '—';
        this.infoCards[1].rows[1].value = data.alergias || '—';
        this.infoCards[1].rows[2].value = data.condicionesMedicas || '—';
        this.infoCards[1].rows[3].value = data.medicamentosActuales || '—';
        this.infoCards[1].rows[4].value = data.seguroMedicoNombre || '—';

        this.infoCards[2].rows[0].value = data.emergenciaNombre || '—';
        this.infoCards[2].rows[1].value = data.emergenciaParentesco || '—';
        this.infoCards[2].rows[2].value = data.emergenciaTelefono || '—';
        this.infoCards[2].rows[3].value = data.emergenciaDireccion || '—';

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando perfil desde backend', err);
      },
    });
    const userId = session?.id || session?.profile?.authUserId;
    if (userId) {
      this.citasService.obtenerProximas(userId).subscribe({
        next: (data: AppointmentHistoryDTO[]) => {
          const meses = [
            'ENE',
            'FEB',
            'MAR',
            'ABR',
            'MAY',
            'JUN',
            'JUL',
            'AGO',
            'SEP',
            'OCT',
            'NOV',
            'DIC',
          ];
          this.citas = data.map((c: AppointmentHistoryDTO) => {
            const fecha = new Date(c.date + 'T00:00:00');
            return {
              day: String(fecha.getDate()).padStart(2, '0'),
              month: meses[fecha.getMonth()],
              doctor: c.doctor,
              especialidad: c.status,
              hora: c.time,
              lugar: '',
            };
          });
          this.stats[0].count = this.citas.length;
          this.cargandoCitas = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.citas = [];
          this.cargandoCitas = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.cargandoCitas = false;
    }
  }
}
