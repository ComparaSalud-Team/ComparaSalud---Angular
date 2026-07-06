import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarProveedorComponent } from '../../../shared/public-navbar-proveedor/public-navbar';
import { SidebarProveedorComponent } from '../../../shared/sidebar-proveedor/sidebar-proveedor';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';
import { AuthService } from '../../../services/auth';
import { PreferencesService } from '../../../services/Preferences.service';
import { UserPreferences } from '../../../models/UserPreferences';

type Seccion = 'preferencias' | 'privacidad' | 'facturacion' | 'ayuda';

@Component({
  selector: 'app-configuracion-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarProveedorComponent,
    SidebarProveedorComponent,
    PublicFooterComponent,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css'],
})
export class ConfiguracionComponent implements OnInit {
  seccionActiva: Seccion = 'preferencias';
  cargando = true;
  guardando = false;
  guardado = false;
  errorMsg = '';
  authUserId = 0;

  prefs: UserPreferences = {
    idioma: 'Español (España)',
    zonaHoraria: 'America/Lima',
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    notifCorreo: true,
    notifPush: true,
    notifSms: false,
    notifRecordatoriosCitas: true,
    notifNuevosMensajes: true,
    notifActualizacionesSistema: false,
    notifCorreosMarketing: false,
    notifReportesSemanales: true,
    noMolestarDesde: '',
    noMolestarHasta: '',
  };

  idiomasOptions = [
    'Español (España)',
    'Español (Latinoamérica)',
    'English',
    'Português',
    'Français',
  ];

  zonasHorarias = [
    'America/Lima',
    'America/Bogota',
    'America/Santiago',
    'America/Buenos_Aires',
    'America/Mexico_City',
    'Europe/Madrid',
  ];

  get notifActivasCount(): number {
    return [
      this.prefs.notifRecordatoriosCitas,
      this.prefs.notifNuevosMensajes,
      this.prefs.notifActualizacionesSistema,
      this.prefs.notifCorreosMarketing,
      this.prefs.notifReportesSemanales,
    ].filter(Boolean).length;
  }

  get fechaEjemplo(): string {
    const hoy = new Date();
    const d = String(hoy.getDate()).padStart(2, '0');
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const y = hoy.getFullYear();
    switch (this.prefs.formatoFecha) {
      case 'MM/DD/YYYY':
        return `${m}/${d}/${y}`;
      case 'YYYY-MM-DD':
        return `${y}-${m}-${d}`;
      default:
        return `${d}/${m}/${y}`;
    }
  }

  get horaEjemplo(): string {
    return this.prefs.formatoHora === '12h' ? '02:30 PM' : '14:30';
  }

  constructor(
    private auth: AuthService,
    private preferencesService: PreferencesService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const session = this.auth.getUser();
    this.authUserId = session?.id || session?.profile?.authUserId || 0;
    this.emailActual = session?.email || session?.profile?.email || '';

    if (!this.authUserId) {
      this.cargando = false;
      return;
    }

    this.preferencesService.obtener(this.authUserId).subscribe({
      next: (data) => {
        this.prefs = { ...this.prefs, ...data };
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  emailActual = '';
  nuevoEmail = '';
  passwordActual = '';
  nuevaPassword = '';
  confirmarPassword = '';
  passwordEliminar = '';
  mostrarPasswordActual = false;
  mostrarNuevaPassword = false;
  mostrarConfirmarPassword = false;
  mensajeSeguridad = '';
  errorSeguridad = '';
  guardandoSeguridad = false;

  actividadReciente: any[] = [];
  cargandoActividad = false;

  get passwordValida(): boolean {
    return (
      this.nuevaPassword.length >= 8 &&
      /[A-Z]/.test(this.nuevaPassword) &&
      /[0-9]/.test(this.nuevaPassword) &&
      /[@#$%^&*!]/.test(this.nuevaPassword)
    );
  }

  cambiarPassword(): void {
    this.errorSeguridad = '';
    this.mensajeSeguridad = '';
    if (!this.passwordActual || !this.nuevaPassword || !this.confirmarPassword) {
      this.errorSeguridad = 'Completa todos los campos.';
      return;
    }
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.errorSeguridad = 'Las contraseñas no coinciden.';
      return;
    }
    if (!this.passwordValida) {
      this.errorSeguridad = 'La nueva contraseña no cumple los requisitos.';
      return;
    }
    this.guardandoSeguridad = true;
    this.auth.cambiarPassword(this.authUserId, this.passwordActual, this.nuevaPassword).subscribe({
      next: () => {
        this.guardandoSeguridad = false;
        this.mensajeSeguridad = 'Contraseña actualizada correctamente.';
        this.passwordActual = '';
        this.nuevaPassword = '';
        this.confirmarPassword = '';
        this.cargarActividadReciente();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.guardandoSeguridad = false;
        this.errorSeguridad = err?.error?.message || 'Error al cambiar la contraseña.';
        this.cdr.detectChanges();
      },
    });
  }

  cambiarEmail(): void {
    this.errorSeguridad = '';
    this.mensajeSeguridad = '';
    if (!this.nuevoEmail || !this.passwordActual) {
      this.errorSeguridad = 'Completa todos los campos.';
      return;
    }
    this.guardandoSeguridad = true;
    this.auth.cambiarEmail(this.authUserId, this.nuevoEmail, this.passwordActual).subscribe({
      next: () => {
        this.guardandoSeguridad = false;
        this.mensajeSeguridad = 'Correo actualizado correctamente.';
        const session = this.auth.getUser();
        if (session) {
          const merged = { ...session, email: this.nuevoEmail };
          localStorage.setItem('cs_user', JSON.stringify(merged));
        }
        this.emailActual = this.nuevoEmail;
        this.nuevoEmail = '';
        this.passwordActual = '';
        this.cargarActividadReciente();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.guardandoSeguridad = false;
        this.errorSeguridad = err?.error?.message || 'Error al cambiar el correo.';
        this.cdr.detectChanges();
      },
    });
  }

  eliminarCuenta(): void {
    if (!this.passwordEliminar) {
      this.errorSeguridad = 'Ingresa tu contraseña para confirmar.';
      return;
    }
    if (!confirm('¿Estás seguro? Esta acción es irreversible.')) return;
    this.auth.eliminarCuenta(this.authUserId, this.passwordEliminar).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.errorSeguridad = err?.error?.message || 'Error al eliminar la cuenta.';
        this.cdr.detectChanges();
      },
    });
  }

  irASeccion(s: Seccion): void {
    this.seccionActiva = s;
    if (s === 'privacidad') {
      this.cargarActividadReciente();
    }
  }

  cargarActividadReciente(): void {
    if (!this.authUserId) return;
    this.cargandoActividad = true;
    this.auth.obtenerActividadReciente(this.authUserId).subscribe({
      next: (data: any[]) => {
        this.actividadReciente = data || [];
        this.cargandoActividad = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.actividadReciente = [];
        this.cargandoActividad = false;
        this.cdr.detectChanges();
      },
    });
  }

  tiempoRelativo(fechaIso: string): string {
    if (!fechaIso) return '';
    const fecha = new Date(fechaIso);
    const ahora = new Date();
    const segundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

    if (segundos < 60) return 'Hace instantes';
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `Hace ${minutos} minuto${minutos === 1 ? '' : 's'}`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} hora${horas === 1 ? '' : 's'}`;
    const dias = Math.floor(horas / 24);
    if (dias < 30) return `Hace ${dias} día${dias === 1 ? '' : 's'}`;
    const meses = Math.floor(dias / 30);
    if (meses < 12) return `Hace ${meses} mes${meses === 1 ? '' : 'es'}`;
    const anios = Math.floor(meses / 12);
    return `Hace ${anios} año${anios === 1 ? '' : 's'}`;
  }

  guardarPreferencias(): void {
    this.guardando = true;
    this.errorMsg = '';
    this.guardado = false;

    this.preferencesService.guardar(this.authUserId, this.prefs).subscribe({
      next: (data) => {
        this.prefs = { ...this.prefs, ...data };
        this.guardando = false;
        this.guardado = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.guardado = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        this.guardando = false;
        this.errorMsg = err?.error?.message || 'No se pudo guardar. Intenta nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  exportarConfiguracion(): void {
    const dataStr = JSON.stringify(this.prefs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'configuracion-comparasalud.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  restablecerDefecto(): void {
    this.preferencesService.restablecer(this.authUserId).subscribe({
      next: (data) => {
        this.prefs = { ...this.prefs, ...data };
        this.guardado = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.guardado = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'No se pudo restablecer.';
        this.cdr.detectChanges();
      },
    });
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  cancelar(): void {
    this.errorMsg = '';
    if (!this.authUserId) return;

    this.preferencesService.obtener(this.authUserId).subscribe({
      next: (data) => {
        this.prefs = { ...this.prefs, ...data };
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }
}
