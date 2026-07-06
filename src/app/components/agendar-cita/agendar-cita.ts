import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PublicNavbarComponent } from '../../shared/public-navbar-paciente/public-navbar';
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

  private inicioSemana!: Date;
  dias: DiaCalendario[] = [];
  fechaSeleccionada = '';

  slots: Availability[] = [];
  cargandoSlots = false;
  errorSlots: string | null = null;
  slotSeleccionado: Availability | null = null;

  motivo = '';
  notas = '';
  errorMotivo: string | null = null;

  metodoPago: 'Tarjeta' | 'PayPal' | 'Transferencia' = 'Tarjeta';

  tarjeta = { numero: '', expiracion: '', cvv: '', titular: '' };
  facturacion = {
    nombre: '',
    apellido: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
  };
  aceptaTerminos = false;

  agendando = false;
  errorAgendar: string | null = null;
  citaConfirmada = false;

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
  private readonly nombresDiasLargos = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
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

  get puedeContinuarAlPago(): boolean {
    return !!this.slotSeleccionado && this.motivo.trim().length > 0;
  }

  continuarAlPago(): void {
    const motivo = this.motivo.trim();
    if (!this.slotSeleccionado) {
      return;
    }
    if (!motivo) {
      this.errorMotivo = 'Indica el motivo de la consulta.';
      return;
    }
    if (motivo.length < 5) {
      this.errorMotivo = 'Describe el motivo con al menos 5 caracteres.';
      return;
    }
    this.errorMotivo = null;
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

  // ── Filtrado de inputs de tarjeta ──
  soloNumerosTarjeta(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 16);
    const agrupado = digitos.replace(/(.{4})/g, '$1 ').trim();
    input.value = agrupado;
    this.tarjeta.numero = agrupado;
  }

  formatoExpiracion(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digitos = input.value.replace(/\D/g, '').slice(0, 4);
    if (digitos.length >= 3) {
      digitos = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }
    input.value = digitos;
    this.tarjeta.expiracion = digitos;
  }

  soloNumerosCvv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = digitos;
    this.tarjeta.cvv = digitos;
  }

  soloNumerosCodigoPostal(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = digitos;
    this.facturacion.codigoPostal = digitos;
  }

  // ── Filtrado de solo letras (para Ciudad) ──
  soloLetrasCiudad(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtrado = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    input.value = filtrado;
    this.facturacion.ciudad = filtrado;
  }

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

  // ── Validación completa antes de confirmar y pagar ──
  private validarPago(): boolean {
    if (this.metodoPago === 'Tarjeta') {
      const numeroDigitos = this.tarjeta.numero.replace(/\s/g, '');
      if (!numeroDigitos) {
        this.errorAgendar = 'Ingresa el número de tarjeta.';
        return false;
      }
      if (numeroDigitos.length < 13 || numeroDigitos.length > 16) {
        this.errorAgendar = 'El número de tarjeta debe tener entre 13 y 16 dígitos.';
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(this.tarjeta.expiracion)) {
        this.errorAgendar = 'La fecha de expiración debe tener el formato MM/AA.';
        return false;
      }
      const [mesStr, añoStr] = this.tarjeta.expiracion.split('/');
      const mes = Number(mesStr);
      const año = Number(añoStr);
      if (mes < 1 || mes > 12) {
        this.errorAgendar = 'El mes de expiración no es válido.';
        return false;
      }
      const ahora = new Date();
      const añoActual = ahora.getFullYear() % 100;
      const mesActual = ahora.getMonth() + 1;
      if (año < añoActual || (año === añoActual && mes < mesActual)) {
        this.errorAgendar = 'La tarjeta ingresada ya está vencida.';
        return false;
      }

      if (this.tarjeta.cvv.length < 3 || this.tarjeta.cvv.length > 4) {
        this.errorAgendar = 'El CVV debe tener 3 o 4 dígitos.';
        return false;
      }

      const titular = this.tarjeta.titular.trim();
      if (!titular) {
        this.errorAgendar = 'Ingresa el nombre del titular de la tarjeta.';
        return false;
      }
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(titular)) {
        this.errorAgendar = 'El nombre del titular solo puede contener letras y espacios.';
        return false;
      }
    }

    const nombre = this.facturacion.nombre.trim();
    const apellido = this.facturacion.apellido.trim();
    if (!nombre || !apellido) {
      this.errorAgendar = 'Completa tu nombre y apellido en la información de facturación.';
      return false;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre) || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellido)) {
      this.errorAgendar = 'El nombre y apellido solo pueden contener letras y espacios.';
      return false;
    }

    if (!this.facturacion.direccion.trim()) {
      this.errorAgendar = 'Ingresa tu dirección de facturación.';
      return false;
    }

    const ciudad = this.facturacion.ciudad.trim();
    if (!ciudad) {
      this.errorAgendar = 'Ingresa tu ciudad.';
      return false;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(ciudad)) {
      this.errorAgendar = 'La ciudad solo puede contener letras.';
      return false;
    }

    if (this.facturacion.codigoPostal && !/^\d{4,10}$/.test(this.facturacion.codigoPostal.trim())) {
      this.errorAgendar = 'El código postal debe contener solo números (4 a 10 dígitos).';
      return false;
    }

    if (!this.aceptaTerminos) {
      this.errorAgendar = 'Debes aceptar los términos y condiciones para continuar.';
      return false;
    }

    this.errorAgendar = null;
    return true;
  }

  confirmarYPagar(): void {
    if (!this.slotSeleccionado || !this.provider) return;
    if (!this.validarPago()) return;

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
