import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PublicNavbarComponent } from '../../shared/public-navbar-paciente/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

import { CitasService } from '../../services/citas';
import { ProviderService } from '../../services/provider.service';
import { AppointmentHistoryDTO, EstadoCita } from '../../models/cita';
import { Availability } from '../../models/availability';

@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './cita-detalle.html',
  styleUrl: './cita-detalle.css',
})
export class CitaDetalleComponent implements OnInit {
  appointmentId!: number;

  cita: AppointmentHistoryDTO | null = null;
  cargando = true;
  error: string | null = null;

  mostrarReagendar = false;
  fechaSeleccionada = '';
  fechaMinima = '';
  slots: Availability[] = [];
  cargandoSlots = false;
  errorSlots: string | null = null;
  slotSeleccionado: Availability | null = null;

  reagendando = false;
  errorReagendar: string | null = null;
  reagendadoOk = false;

  cancelando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private citasService: CitasService,
    private providerService: ProviderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.fechaMinima = this.formatearFecha(new Date());
    this.fechaSeleccionada = this.fechaMinima;
    this.mostrarReagendar = this.route.snapshot.queryParamMap.get('reagendar') === 'true';

    if (!this.appointmentId) {
      this.error = 'No se especificó una cita válida.';
      this.cargando = false;
      return;
    }

    this.cargarCita();
  }

  cargarCita(): void {
    this.cargando = true;
    this.error = null;

    this.citasService.obtenerPorId(this.appointmentId).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.cargando = false;
        this.cdr.detectChanges();
        if (this.mostrarReagendar && this.puedeReagendar) {
          this.cargarDisponibilidad();
        }
      },
      error: () => {
        this.error = 'No se pudo cargar la información de esta cita.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get puedeReagendar(): boolean {
    return !!this.cita && this.cita.status !== 'COMPLETED' && this.cita.status !== 'CANCELLED';
  }

  get estado(): EstadoCita {
    switch (this.cita?.status) {
      case 'COMPLETED':
        return 'completada';
      case 'CANCELLED':
        return 'cancelada';
      case 'SCHEDULED':
        return 'confirmada';
      default:
        return 'proxima';
    }
  }

  toggleReagendar(): void {
    this.mostrarReagendar = !this.mostrarReagendar;
    if (this.mostrarReagendar) {
      this.cargarDisponibilidad();
    }
  }

  private formatearFecha(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarDisponibilidad(): void {
    if (!this.cita) return;
    this.slotSeleccionado = null;
    this.cargandoSlots = true;
    this.errorSlots = null;

    this.providerService.getAvailability(this.cita.providerId, this.fechaSeleccionada).subscribe({
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

  onFechaChange(): void {
    this.cargarDisponibilidad();
  }

  seleccionarSlot(slot: Availability): void {
    if (!slot.isAvailable) return;
    this.slotSeleccionado = slot;
  }

  formatearHora(hora: string): string {
    const [h, m] = hora.split(':');
    const hNum = Number(h);
    const periodo = hNum >= 12 ? 'pm' : 'am';
    const hora12 = hNum % 12 === 0 ? 12 : hNum % 12;
    return `${hora12}:${m} ${periodo}`;
  }

  private calcularHoraFin(horaInicio: string): string {
    const duracion = this.cita?.durationMinutes || 30;
    const [h, m] = horaInicio.split(':').map(Number);
    const total = h * 60 + m + duracion;
    const hf = Math.floor(total / 60) % 24;
    const mf = total % 60;
    return `${String(hf).padStart(2, '0')}:${String(mf).padStart(2, '0')}`;
  }

  confirmarReagendar(): void {
    if (!this.slotSeleccionado || !this.cita) return;

    this.reagendando = true;
    this.errorReagendar = null;

    this.citasService
      .reprogramarCita(this.appointmentId, {
        newDate: this.fechaSeleccionada,
        newStartTime: this.slotSeleccionado.startTime,
        newEndTime: this.calcularHoraFin(this.slotSeleccionado.startTime),
      })
      .subscribe({
        next: () => {
          this.reagendando = false;
          this.reagendadoOk = true;
          this.cargarCita();
        },
        error: (err) => {
          this.reagendando = false;
          this.errorReagendar =
            err?.error?.message || 'No se pudo reagendar la cita. Intenta con otro horario.';
          this.cdr.detectChanges();
        },
      });
  }

  cancelarCita(): void {
    if (!confirm('¿Seguro que deseas cancelar esta cita?')) return;

    this.cancelando = true;
    this.citasService.cancelarCita(this.appointmentId).subscribe({
      next: () => {
        this.cancelando = false;
        this.cargarCita();
      },
      error: () => {
        this.cancelando = false;
        alert('No se pudo cancelar la cita. Intenta nuevamente.');
      },
    });
  }

  volver(): void {
    this.location.back();
  }
}
