import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NavbarClinicaComponent } from '../../../shared/public-navbar-clinica/public-navbar';
import { SidebarClinicaComponent } from '../../../shared/sidebar-clinica/sidebar-clinica';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';

interface HorarioItem {
  label: string;
  valor: string;
}

interface DepartamentoCard {
  nombre: string;
  descripcion: string;
  badge: string;
  imagen: string;
}

interface ClinicaPerfil {
  nombre: string;
  logoUrl: string;
  activa: boolean;
  clinicType: string;
  foundedYear: number | null;
  bedsCount: number | null;
  cantidadProveedores: number;
  ruc: string;
  descripcion: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  telefono: string;
  emergencyPhone: string;
  email: string;
  website: string;
  calificacion: number;
  totalResenas: number;
  especialidades: string[];
  certificaciones: string[];
  seguros: string[];
  horario: HorarioItem[];
  emergencia24h: boolean;
  estacionamiento: boolean;
}

const DEPT_IMAGENES = [
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
  'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=400&q=80',
  'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
];

@Component({
  selector: 'app-perfil-clinica',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarClinicaComponent,
    SidebarClinicaComponent,
    PublicFooterComponent,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  user: any = null;
  departamentos: DepartamentoCard[] = [];

  clinica: ClinicaPerfil = {
    nombre: '',
    logoUrl: '',
    activa: false,
    clinicType: '',
    foundedYear: null,
    bedsCount: null,
    cantidadProveedores: 0,
    ruc: '',
    descripcion: '',
    direccion: '',
    distrito: '',
    ciudad: '',
    telefono: '',
    emergencyPhone: '',
    email: '',
    website: '',
    calificacion: 0,
    totalResenas: 0,
    especialidades: [],
    certificaciones: [],
    seguros: [],
    horario: [],
    emergencia24h: false,
    estacionamiento: false,
  };

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
    this.mapClinicProfile(this.user);
    this.mapDepartamentos(this.user?.departments || []);
  }

  get googleMapsUrl(): string {
    const query = encodeURIComponent(this.clinica.direccion);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  private mapClinicProfile(profile: any): void {
    if (!profile) return;

    const nombre = profile.name || 'Clínica';

    this.clinica = {
      ...this.clinica,
      nombre,
      logoUrl:
        profile.photoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=10B981&color=fff&size=256`,
      activa: !!profile.isActive,
      clinicType: profile.clinicType || 'Clínica',
      foundedYear: profile.foundedYear ?? null,
      bedsCount: profile.bedsCount ?? null,
      cantidadProveedores: profile.providerCount ?? 0,
      ruc: profile.ruc || '',
      descripcion: profile.description || '',
      direccion: [profile.street, profile.district, profile.city, profile.country]
        .filter(Boolean)
        .join(', '),
      distrito: profile.district || '',
      ciudad: profile.city || '',
      telefono: profile.phone || '',
      emergencyPhone: profile.emergencyPhone || '',
      email: profile.email || '',
      website: profile.website || '',
      calificacion: Number(profile.rating) || 0,
      totalResenas: profile.reviewCount ?? 0,
      especialidades: profile.specialties || [],
      certificaciones: profile.certifications || [],
      seguros: profile.insuranceAccepted || [],
      horario: (profile.schedule || []).map((raw: string) => {
        const [label, valor] = raw.split('|');
        return { label: label?.trim() || '', valor: valor?.trim() || '' };
      }),
      emergencia24h: !!profile.emergencia24h,
      estacionamiento: !!profile.estacionamiento,
    };
  }

  private mapDepartamentos(departments: any[]): void {
    this.departamentos = (departments || []).map((d, i) => ({
      nombre: d.name,
      descripcion: `${d.currentPatients}/${d.capacity} pacientes`,
      badge: d.capacity ? `${d.capacity} camas/salas` : '',
      imagen: DEPT_IMAGENES[i % DEPT_IMAGENES.length],
    }));
  }

  onEditPhoto(): void {}
}
