import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarClinicaComponent } from '../../../shared/public-navbar-clinica/public-navbar';
import { SidebarClinicaComponent } from '../../../shared/sidebar-clinica/sidebar-clinica';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';
import { ClinicService } from '../../../services/clinic.service';
import { AuthService } from '../../../services/auth';

type Seccion = 'general' | 'ubicacion' | 'servicios' | 'seguros' | 'certificaciones' | 'horario';

@Component({
  selector: 'app-editar-perfil-clinica',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarClinicaComponent,
    SidebarClinicaComponent,
    PublicFooterComponent,
  ],
  templateUrl: './editar-perfil.html',
  styleUrls: ['./editar-perfil.css'],
})
export class EditarPerfilComponent implements OnInit {
  seccionActiva: Seccion = 'general';
  cargando = true;
  guardando = false;
  errorMsg = '';

  clinicId = 0;

  clinica: any = {
    name: '',
    ruc: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    website: '',
    description: '',
    clinicType: '',
    foundedYear: null,
    bedsCount: null,
    street: '',
    district: '',
    city: '',
    country: '',
    emergencia24h: false,
    estacionamiento: false,
    farmacia: false,
    laboratorio: false,
    imagenologia: false,
    servicioAmbulancia: false,
    unidadCuidadosIntensivos: false,
    hospitalizacion: false,
    insuranceAccepted: [],
    certifications: [],
    schedule: [],
  };

  avatar = '';

  nuevoSeguro = '';
  nuevaCertificacion = '';

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diasSeleccionados: string[] = [];
  horaInicio = '';
  horaFin = '';
  horarioError = '';

  constructor(
    private router: Router,
    private clinicService: ClinicService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const session = this.auth.getUser();
    const profile = session?.profile || session;
    this.clinicId = profile?.id;

    if (!this.clinicId) {
      this.errorMsg = 'No se pudo identificar la clínica. Inicia sesión nuevamente.';
      this.cargando = false;
      return;
    }

    this.clinicService.buscarPorId(this.clinicId).subscribe({
      next: (data: any) => {
        this.clinica = { ...this.clinica, ...data };
        this.avatar =
          data.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(this.clinica.name || 'Clínica')}&background=10B981&color=fff&size=128`;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando perfil de la clínica', err);
        this.errorMsg = 'No se pudo cargar el perfil de la clínica.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  irASeccion(seccion: Seccion): void {
    this.seccionActiva = seccion;
  }

  soloNumeros(campo: 'phone' | 'emergencyPhone', event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtrado = input.value.replace(/\D/g, '').slice(0, 9);
    if (filtrado !== input.value) {
      input.value = filtrado;
    }
    this.clinica[campo] = filtrado;
  }

  porcentajePerfil(): number {
    const checks = [
      !!this.clinica.name?.trim(),
      !!this.clinica.phone?.trim(),
      !!this.clinica.description?.trim(),
      !!this.clinica.clinicType?.trim(),
      !!this.clinica.foundedYear,
      !!this.clinica.bedsCount,
      !!this.clinica.street?.trim() && !!this.clinica.city?.trim(),
      !!this.clinica.emergencyPhone?.trim(),
      !!this.clinica.website?.trim(),
      this.clinica.insuranceAccepted.length > 0,
      this.clinica.certifications.length > 0,
      this.clinica.schedule.length > 0,
    ];
    const completados = checks.filter(Boolean).length;
    return Math.round((completados / checks.length) * 100);
  }

  agregarSeguro(): void {
    if (this.nuevoSeguro.trim()) {
      this.clinica.insuranceAccepted.push(this.nuevoSeguro.trim());
      this.nuevoSeguro = '';
    }
  }
  quitarSeguro(index: number): void {
    this.clinica.insuranceAccepted.splice(index, 1);
  }

  agregarCertificacion(): void {
    if (this.nuevaCertificacion.trim()) {
      this.clinica.certifications.push(this.nuevaCertificacion.trim());
      this.nuevaCertificacion = '';
    }
  }
  quitarCertificacion(index: number): void {
    this.clinica.certifications.splice(index, 1);
  }

  toggleDia(dia: string): void {
    const idx = this.diasSeleccionados.indexOf(dia);
    if (idx === -1) {
      this.diasSeleccionados.push(dia);
    } else {
      this.diasSeleccionados.splice(idx, 1);
    }
  }

  agregarHorario(): void {
    if (!this.diasSeleccionados.length || !this.horaInicio || !this.horaFin) {
      this.horarioError = 'Selecciona al menos un día y ambas horas.';
      return;
    }
    if (this.horaFin <= this.horaInicio) {
      this.horarioError = 'La hora de fin debe ser posterior a la hora de inicio.';
      return;
    }
    this.horarioError = '';

    const ordenados = this.diasSemana.filter((d) => this.diasSeleccionados.includes(d));
    const bloque = `${ordenados.join(', ')}|${this.horaInicio} - ${this.horaFin}`;
    this.clinica.schedule.push(bloque);

    this.diasSeleccionados = [];
    this.horaInicio = '';
    this.horaFin = '';
  }

  quitarHorario(index: number): void {
    this.clinica.schedule.splice(index, 1);
  }

  validarFormulario(): boolean {
    const nombre = this.clinica.name?.trim() || '';
    if (!nombre) {
      this.errorMsg = 'El nombre de la clínica es obligatorio.';
      return false;
    }
    if (nombre.length < 3) {
      this.errorMsg = 'El nombre debe tener al menos 3 caracteres.';
      return false;
    }

    const soloDigitos = (valor: string) => (valor || '').replace(/\D/g, '');

    const telefono = this.clinica.phone?.trim() || '';
    if (telefono) {
      const digitos = soloDigitos(telefono);
      if (digitos.length < 7 || digitos.length > 9) {
        this.errorMsg = 'El teléfono debe tener entre 7 y 9 dígitos.';
        return false;
      }
    }

    const telefonoEmergencia = this.clinica.emergencyPhone?.trim() || '';
    if (telefonoEmergencia) {
      const digitos = soloDigitos(telefonoEmergencia);
      if (digitos.length < 7 || digitos.length > 9) {
        this.errorMsg = 'El teléfono de emergencia debe tener entre 7 y 9 dígitos.';
        return false;
      }
    }

    if (
      this.clinica.foundedYear !== null &&
      this.clinica.foundedYear !== undefined &&
      this.clinica.foundedYear !== '' &&
      (this.clinica.foundedYear < 1900 || this.clinica.foundedYear > new Date().getFullYear())
    ) {
      this.errorMsg = 'El año de fundación no es válido.';
      return false;
    }

    if (
      this.clinica.bedsCount !== null &&
      this.clinica.bedsCount !== undefined &&
      this.clinica.bedsCount !== '' &&
      this.clinica.bedsCount < 0
    ) {
      this.errorMsg = 'El número de camas no puede ser negativo.';
      return false;
    }

    if (this.clinica.website && !/^https?:\/\/.+\..+/.test(this.clinica.website)) {
      this.errorMsg = 'La URL del sitio web no es válida (debe iniciar con http:// o https://).';
      return false;
    }

    this.errorMsg = '';
    return true;
  }

  guardarCambios(): void {
    if (!this.validarFormulario()) {
      return;
    }
    this.guardando = true;

    this.clinicService.actualizar(this.clinicId, this.clinica).subscribe({
      next: (updated: any) => {
        this.guardando = false;
        const session = this.auth.getUser();
        if (session) {
          const merged = { ...session, profile: { ...session.profile, ...updated } };
          localStorage.setItem('cs_user', JSON.stringify(merged));
        }
        this.router.navigate(['/perfil/clinica']);
      },
      error: (err: any) => {
        this.guardando = false;
        this.errorMsg = err?.error?.message || 'No se pudo guardar los cambios.';
      },
    });
  }

  regresar(): void {
    this.router.navigate(['/perfil/clinica']);
  }
}
