import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

import { ProviderService } from '../../services/provider.service';
import { CitasService } from '../../services/citas';
import { AuthService } from '../../services/auth';
import { Provider } from '../../models/provider.model';
import { Availability } from '../../models/availability';

interface DiaCalendario {
  fecha: string; // YYYY-MM-DD
  labelDia: string; // Lun, Mar...
  numero: number;
  labelMes: string; // MAY
  deshabilitado: boolean;
}

// HU33 – Agendar cita. Ruta protegida: /agendar-cita/:providerId.
// Wizard de 3 pasos: Seleccionar médico (completado al llegar con el
// providerId en la URL) → Fecha y hora → Pago y Confirmación. El "pago" es
// solo la elección del método: los datos de la tarjeta se quedan en el
// navegador y NUNCA se envían ni guardan (no hay pasarela real).
@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './agendar-cita.html',
  styleUrl: './agendar-cita.css',
})
export class AgendarCitaComponent implements OnInit {
  providerId!: number;
  provider: Provider | null = null;
  cargandoProvider = true;
  errorProvider: string | null = null;

  paso: 2 | 3 = 2;

  // ── Paso 2: fecha y hora ─────────────────────────────────────────────
  private inicioSemana!: Date; // lunes de la semana visible
  dias: DiaCalendario[] = [];
  fechaSeleccionada = '';

  slots: Availability[] = [];
  cargandoSlots = false;
  errorSlots: string | null = null;
  slotSeleccionado: Availability | null = null;

  motivo = '';
  notas = '';

  // ── Paso 3: pago ─────────────────────────────────────────────────────
  metodoPago: 'Tarjeta' | 'PayPal' | 'Transferencia' = 'Tarjeta';

  // Solo viven en el navegador para la simulación del formulario; no se
  // envían al backend ni se guardan en ningún lado.
  tarjeta = { numero: '', expiracion: '', cvv: '', titular: '' };
  facturacion = { nombre: '', apellido: '', direccion: '', ciudad: '', estado: '', codigoPostal: '' };
  aceptaTerminos = false;

  agendando = false;
  errorAgendar: string | null = null;
  citaConfirmada = false;

  private readonly nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  private readonly nombresMeses = [
    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
  ];
  private readonly nombresMesesLargos = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  private readonly nombresDiasLargos = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ProviderService,
    private citasService: CitasService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.providerId = Number(this.route.snapshot.paramMap.get('providerId'));

    if (!this.providerId) {
      this.errorProvider = 'No se especificó un proveedor válido.';
      this.cargandoProvider = false;
      return;
    }

    const hoy = new Date();
    this.inicioSemana = this.lunesDe(hoy);
    this.fechaSeleccionada = this.formatearFecha(hoy);
    this.construirSemana();

    this.cargarProvider();
    this.cargarDisponibilidad();
  }

  // ── Provider ──────────────────────────────────────────────────────────
  cargarProvider(): void {
    this.cargandoProvider = true;
    this.errorProvider = null;

    this.providerService.getById(this.providerId).subscribe({
      next: (provider) => {
        this.provider = provider;
        this.cargandoProvider = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorProvider = 'No se pudo cargar la información del proveedor.';
        this.cargandoProvider = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Calendario semanal ────────────────────────────────────────────────
  private lunesDe(d: Date): Date {
    const copia = new Date(d);
    const dia = copia.getDay(); // 0 = domingo
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

    // Si el día seleccionado quedó fuera de la semana visible, se selecciona
    // el primer día habilitado de la nueva semana.
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

  // ── Disponibilidad ────────────────────────────────────────────────────
  cargarDisponibilidad(): void {
    this.slotSeleccionado = null;
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

  get slotsManana(): Availability[] {
    return this.slots.filter((s) => Number(s.startTime.split(':')[0]) < 12);
  }

  get slotsTarde(): Availability[] {
    return this.slots.filter((s) => Number(s.startTime.split(':')[0]) >= 12);
  }

  seleccionarSlot(slot: Availability): void {
    if (!slot.isAvailable) return;
    this.slotSeleccionado = slot;
  }

  // ── Formatos ──────────────────────────────────────────────────────────
  private formatearFecha(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fechaLegible(): string {
    if (!this.fechaSeleccionada) return '';
    const d = new Date(`${this.fechaSeleccionada}T00:00:00`);
    return `${this.nombresDiasLargos[d.getDay()]}, ${d.getDate()} de ${this.nombresMesesLargos[d.getMonth()]} ${d.getFullYear()}`;
  }

  get duracionMin(): number {
    return this.provider?.durationMinutes || 30;
  }

  get horaFin(): string {
    if (!this.slotSeleccionado) return '';
    const [h, m] = this.slotSeleccionado.startTime.split(':').map(Number);
    const total = h * 60 + m + this.duracionMin;
    const hf = Math.floor(total / 60) % 24;
    const mf = total % 60;
    return `${String(hf).padStart(2, '0')}:${String(mf).padStart(2, '0')}`;
  }

  formatearHora(hora: string): string {
    return hora.split(':').slice(0, 2).join(':');
  }

  get nombrePaciente(): string {
    const session = this.auth.getUser();
    return session?.profile?.name || session?.profile?.fullName || session?.email || '';
  }

  get precio(): number {
    return this.provider?.pricePerAppointment || 0;
  }

  // ── Navegación entre pasos ────────────────────────────────────────────
  get puedeContinuarAlPago(): boolean {
    return !!this.slotSeleccionado && this.motivo.trim().length > 0;
  }

  continuarAlPago(): void {
    if (!this.puedeContinuarAlPago) return;
    this.paso = 3;
    window.scrollTo({ top: 0 });
  }

  volverAFechaHora(): void {
    this.paso = 2;
    window.scrollTo({ top: 0 });
  }

  cambiarMedico(): void {
    this.router.navigate(['/busqueda-paciente']);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }

  // ── Paso 3: pago y confirmación ───────────────────────────────────────
  get datosTarjetaCompletos(): boolean {
    if (this.metodoPago !== 'Tarjeta') return true;
    return (
      this.tarjeta.numero.trim().length > 0 &&
      this.tarjeta.expiracion.trim().length > 0 &&
      this.tarjeta.cvv.trim().length > 0 &&
      this.tarjeta.titular.trim().length > 0
    );
  }

  get puedeConfirmar(): boolean {
    return this.aceptaTerminos && this.datosTarjetaCompletos && !this.agendando;
  }

  confirmarYPagar(): void {
    if (!this.puedeConfirmar || !this.slotSeleccionado || !this.provider) return;

    const user = this.auth.getUser();
    const patientId = user?.profile?.id;

    if (!patientId) {
      this.errorAgendar = 'No se pudo identificar tu perfil de paciente. Inicia sesión nuevamente.';
      return;
    }

    this.agendando = true;
    this.errorAgendar = null;

    const notasCompletas = [this.motivo.trim(), this.notas.trim()].filter(Boolean).join(' — ');

    this.citasService
      .agendarCita({
        patientId,
        providerId: this.providerId,
        serviceName: this.provider.specialty || 'Consulta General',
        date: this.fechaSeleccionada,
        startTime: this.slotSeleccionado.startTime,
        endTime: this.horaFin,
        notes: notasCompletas || undefined,
        // Solo el nombre del método: los datos de la tarjeta no salen del navegador.
        paymentMethod: this.metodoPago,
      })
      .subscribe({
        next: () => {
          this.agendando = false;
          this.citaConfirmada = true;
          window.scrollTo({ top: 0 });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.agendando = false;
          this.errorAgendar =
            err?.error?.message || 'No se pudo agendar la cita. Intenta con otro horario.';
          this.cdr.detectChanges();
        },
      });
  }

  irAMisCitas(): void {
    this.router.navigate(['/mis-citas']);
  }
}
