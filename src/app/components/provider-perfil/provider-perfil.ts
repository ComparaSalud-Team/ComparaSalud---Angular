import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PublicNavbarComponent } from '../../shared/public-navbar-paciente/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

import { AuthService } from '../../services/auth';
import { ProviderService } from '../../services/provider.service';
import { FavoritoService } from '../../services/favorito.service';
import { CitasService } from '../../services/citas';
import { Provider } from '../../models/provider.model';
import { Availability } from '../../models/availability';
import { AppointmentHistoryDTO } from '../../models/cita';

interface DiaCalendario {
  fecha: string;
  labelDia: string;
  numero: number;
  labelMes: string;
  deshabilitado: boolean;
}

@Component({
  selector: 'app-provider-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './provider-perfil.html',
  styleUrl: './provider-perfil.css',
})
export class ProviderPerfilComponent implements OnInit {
  providerId!: number;

  provider: Provider | null = null;
  cargando = true;
  error: string | null = null;

  private patientId: number | null = null;
  private userId: number | null = null;

  esFavorito = false;
  favoritoId: number | null = null;
  cargandoFavorito = false;

  private inicioSemana!: Date;
  dias: DiaCalendario[] = [];
  fechaSeleccionada = '';

  slots: Availability[] = [];
  cargandoSlots = false;
  errorSlots: string | null = null;

  citaConEsteMedico: AppointmentHistoryDTO | null = null;
  cargandoCita = true;

  private readonly banderasPorPais: Record<string, string> = {
    perú: '🇵🇪',
    peru: '🇵🇪',
    chile: '🇨🇱',
    colombia: '🇨🇴',
    méxico: '🇲🇽',
    mexico: '🇲🇽',
    argentina: '🇦🇷',
    españa: '🇪🇸',
  };

  private readonly nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  private readonly nombresMeses = [
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
  private readonly nombresMesesLargos = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private auth: AuthService,
    private providerService: ProviderService,
    private favoritoService: FavoritoService,
    private citasService: CitasService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));

    const hoy = new Date();
    this.inicioSemana = this.lunesDe(hoy);
    this.fechaSeleccionada = this.formatearFecha(hoy);
    this.construirSemana();

    const session = this.auth.getUser();
    this.userId = session?.userId ?? null;
    this.patientId = session?.profile?.id ?? session?.id ?? null;

    if (!this.providerId) {
      this.error = 'Proveedor no válido.';
      this.cargando = false;
      return;
    }

    this.cargarProvider();
    this.cargarDisponibilidad();
    this.cargarFavorito();
    this.cargarCitaConEsteMedico();
  }

  cargarProvider(): void {
    this.cargando = true;
    this.error = null;

    this.providerService.getById(this.providerId).subscribe({
      next: (provider) => {
        this.provider = provider;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar la información de este proveedor.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  banderaFor(pais: string | undefined): string {
    if (!pais) return '';
    return this.banderasPorPais[pais.trim().toLowerCase()] || '';
  }

  direccionCompleta(): string {
    if (!this.provider) return '';
    return [this.provider.street, this.provider.district, this.provider.city, this.provider.country]
      .filter(Boolean)
      .join(', ');
  }

  linkGoogleMaps(): string {
    const query = encodeURIComponent(this.direccionCompleta());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  private lunesDe(d: Date): Date {
    const copia = new Date(d);
    const dia = copia.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    copia.setDate(copia.getDate() + diff);
    copia.setHours(0, 0, 0, 0);
    return copia;
  }

  private construirSemana(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    this.dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.inicioSemana);
      d.setDate(d.getDate() + i);
      this.dias.push({
        fecha: this.formatearFecha(d),
        labelDia: this.nombresDias[d.getDay()],
        numero: d.getDate(),
        labelMes: this.nombresMeses[d.getMonth()],
        deshabilitado: d < hoy,
      });
    }
  }

  get tituloSemana(): string {
    const fin = new Date(this.inicioSemana);
    fin.setDate(fin.getDate() + 6);
    const mesInicio = this.nombresMesesLargos[this.inicioSemana.getMonth()];
    const mesFin = this.nombresMesesLargos[fin.getMonth()];
    const año = fin.getFullYear();
    return mesInicio === mesFin ? `${mesInicio} ${año}` : `${mesInicio} / ${mesFin} ${año}`;
  }

  get puedeRetrocederSemana(): boolean {
    return this.lunesDe(new Date()) < this.inicioSemana;
  }

  cambiarSemana(delta: number): void {
    if (delta < 0 && !this.puedeRetrocederSemana) return;
    const nuevo = new Date(this.inicioSemana);
    nuevo.setDate(nuevo.getDate() + delta * 7);
    this.inicioSemana = nuevo;
    this.construirSemana();

    if (!this.dias.some((d) => d.fecha === this.fechaSeleccionada && !d.deshabilitado)) {
      const primero = this.dias.find((d) => !d.deshabilitado);
      if (primero) this.seleccionarDia(primero);
    }
  }

  seleccionarDia(dia: DiaCalendario): void {
    if (dia.deshabilitado) return;
    this.fechaSeleccionada = dia.fecha;
    this.cargarDisponibilidad();
  }

  cargarDisponibilidad(): void {
    this.cargandoSlots = true;
    this.errorSlots = null;

    this.providerService.getAvailability(this.providerId, this.fechaSeleccionada).subscribe({
      next: (slots) => {
        this.slots = slots;
        this.cargandoSlots = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.slots = [];
        this.errorSlots = 'No se pudo cargar la disponibilidad para esta fecha.';
        this.cargandoSlots = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatearHora(hora: string): string {
    const [h, m] = hora.split(':');
    const hNum = Number(h);
    const periodo = hNum >= 12 ? 'pm' : 'am';
    const hora12 = hNum % 12 === 0 ? 12 : hNum % 12;
    return `${hora12}:${m} ${periodo}`;
  }

  private formatearFecha(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  agendarCita(): void {
    this.router.navigate(['/agendar-cita', this.providerId]);
  }

  cargarFavorito(): void {
    if (!this.patientId) return;

    this.favoritoService.listarFavoritos(this.patientId).subscribe({
      next: (favoritos) => {
        const match = favoritos.find((f) => f.providerId === this.providerId);
        this.esFavorito = !!match;
        this.favoritoId = match?.favoriteId ?? null;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  toggleFavorito(): void {
    if (!this.patientId || this.cargandoFavorito) return;
    this.cargandoFavorito = true;

    const accion = this.esFavorito
      ? this.favoritoService.eliminarFavorito(this.patientId, this.providerId)
      : this.favoritoService.agregarFavorito(this.patientId, this.providerId);

    accion.subscribe({
      next: () => {
        this.esFavorito = !this.esFavorito;
        this.cargandoFavorito = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoFavorito = false;
      },
    });
  }

  cargarCitaConEsteMedico(): void {
    if (!this.userId) {
      this.cargandoCita = false;
      return;
    }

    this.cargandoCita = true;
    this.citasService.obtenerProximas(this.userId).subscribe({
      next: (proximas) => {
        this.citaConEsteMedico = proximas.find((c) => c.providerId === this.providerId) || null;
        this.cargandoCita = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.citaConEsteMedico = null;
        this.cargandoCita = false;
        this.cdr.detectChanges();
      },
    });
  }

  verDetalleCita(): void {
    if (!this.citaConEsteMedico) return;
    this.router.navigate(['/mis-citas', this.citaConEsteMedico.appointmentId]);
  }

  reagendarCita(): void {
    if (!this.citaConEsteMedico) return;
    this.router.navigate(['/mis-citas', this.citaConEsteMedico.appointmentId], {
      queryParams: { reagendar: true },
    });
  }

  cancelarCita(): void {
    if (!this.citaConEsteMedico) return;
    if (!confirm('¿Seguro que deseas cancelar esta cita?')) return;

    this.citasService.cancelarCita(this.citaConEsteMedico.appointmentId).subscribe({
      next: () => this.cargarCitaConEsteMedico(),
      error: () => alert('No se pudo cancelar la cita. Intenta nuevamente.'),
    });
  }

  volver(): void {
    this.location.back();
  }
}
