import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NavbarProveedorComponent } from '../../../shared/public-navbar-proveedor/public-navbar';
import { SidebarProveedorComponent } from '../../../shared/sidebar-proveedor/sidebar-proveedor';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';

interface Educacion {
  titulo: string;
  institucion: string;
  periodo: string;
  detalle: string;
}

interface Precio {
  nombre: string;
  monto: number;
}

interface DoctorPerfil {
  nombre: string;
  photoUrl: string;
  verificado: boolean;
  especialidades: string[];
  aniosExperiencia: number;
  idiomas: string[];
  calificacion: number;
  descripcionProfesional: string;
  consultorioDireccion: string;
  telefono: string;
  email: string;
  precios: Precio[];

  pacientesAtendidos: number | null;
  totalResenas: number | null;
  tasaRecomendacion: number | null;
  areasEnfoque: string[];
  cedulaProfesional: string;
  registroMedico: string;
  educacion: Educacion[];
  certificaciones: string[];
  horario: string[];
  servicios: string[];
}

@Component({
  selector: 'app-perfil-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarProveedorComponent,
    SidebarProveedorComponent,
    PublicFooterComponent,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  user: any = null;

  doctor: DoctorPerfil = {
    nombre: '',
    photoUrl: '',
    verificado: false,
    especialidades: [],
    aniosExperiencia: 0,
    idiomas: [],
    calificacion: 0,
    descripcionProfesional: '',
    consultorioDireccion: '',
    telefono: '',
    email: '',
    precios: [],
    pacientesAtendidos: null,
    totalResenas: null,
    tasaRecomendacion: null,
    areasEnfoque: [],
    cedulaProfesional: '',
    registroMedico: '',
    educacion: [],
    certificaciones: [],
    horario: [],
    servicios: [],
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
    this.mapProviderProfile(this.user);
  }

  private mapProviderProfile(profile: any): void {
    if (!profile) return;

    const nombre = profile.fullName || 'Doctor';

    this.doctor = {
      ...this.doctor,
      nombre,
      photoUrl:
        profile.photoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0EA5E9&color=fff&size=256`,
      verificado: !!profile.isValidated,
      especialidades: profile.specialty
        ? profile.specialty
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      aniosExperiencia: profile.experienceYears ?? 0,
      idiomas: profile.language
        ? profile.language
            .split(',')
            .map((l: string) => l.trim())
            .filter(Boolean)
        : [],
      calificacion:
        Number(profile.averageRating) > 0
          ? Number(profile.averageRating)
          : Number(profile.rating ?? 0),
      descripcionProfesional: profile.description || '',
      consultorioDireccion: [profile.street, profile.district, profile.city, profile.country]
        .filter(Boolean)
        .join(', '),
      telefono: profile.phone || '',
      email: profile.email || '',
      precios: (profile.precios || [])
        .map((p: any) => ({ nombre: p.nombre, monto: Number(p.monto) }))
        .sort((a: Precio, b: Precio) => a.monto - b.monto),

      areasEnfoque: profile.areasEnfoque || [],
      cedulaProfesional: profile.cedulaProfesional || '',
      registroMedico: profile.registroMedico || '',
      educacion: profile.educacion || [],
      certificaciones: profile.certificaciones || [],
      horario: profile.horario || [],
      servicios: (profile.services || []).map((s: any) => s.name),
    };
  }

  onEditPhoto(): void {}
}
