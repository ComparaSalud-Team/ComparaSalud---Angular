import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { CitasService } from '../../services/citas';
import { Cita, AppointmentHistoryDTO } from '../../models/cita';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css',
})
export class MisCitasComponent implements OnInit {
  user: any = null;
  tabActivo = 'todas';

  citas: Cita[] = [];
  cargando = true;
  error: string | null = null;

  get citasFiltradas() {
    if (this.tabActivo === 'todas') return this.citas;
    if (this.tabActivo === 'proximas') {
      return this.citas.filter((c) => c.estado === 'proxima' || c.estado === 'confirmada');
    }
    return this.citas.filter((c) => c.estado === this.tabActivo);
  }

  get totalCitas() {
    return this.citas.length;
  }

  get totalProximas() {
    return this.citas.filter((c) => c.estado === 'proxima' || c.estado === 'confirmada').length;
  }

  get totalCompletadas() {
    return this.citas.filter((c) => c.estado === 'completada').length;
  }

  get totalCanceladas() {
    return this.citas.filter((c) => c.estado === 'cancelada').length;
  }

  constructor(
    private auth: AuthService,
    private citasService: CitasService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.cargarCitas();
  }

  cargarCitas() {
    const userId = this.user?.userId;
    if (!userId) {
      this.cargando = false;
      this.error = 'No se pudo identificar al usuario. Inicia sesión nuevamente.';
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.error = null;

    forkJoin({
      // Backend responde 404 cuando el paciente aún no tiene historial
      historial: this.citasService.obtenerHistorial(userId).pipe(catchError(() => of([]))),
      proximas: this.citasService.obtenerProximas(userId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ historial, proximas }) => {
        this.citas = [...proximas, ...historial].map((h) => this.mapearCita(h));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudieron cargar tus citas. Intenta nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  private mapearCita(h: AppointmentHistoryDTO): Cita {
    return {
      id: `APT-${h.appointmentId}`,
      appointmentId: h.appointmentId,
      providerId: h.providerId,
      doctorNombre: h.doctor,
      doctorImagen: h.photoUrl || 'assets/images/doctor-card-1.png',
      especialidad: h.specialty || '',
      calificacion: h.rating || 0,
      fecha: h.date,
      hora: h.time,
      duracionMin: h.durationMinutes || 30,
      ubicacion: h.district || '',
      modalidad: h.modality || 'Presencial',
      estado: this.mapearEstado(h.status),
      precio: h.price || 0,
      moneda: 'PEN',
    };
  }

  private mapearEstado(status: string): Cita['estado'] {
    switch (status) {
      case 'COMPLETED':
        return 'completada';
      case 'CANCELLED':
        return 'cancelada';
      case 'SCHEDULED':
        return 'confirmada';
      case 'PENDING':
        return 'proxima';
      default:
        return 'proxima';
    }
  }

  setTab(tab: string) {
    this.tabActivo = tab;
  }

  verDetalles(cita: Cita) {
    this.router.navigate(['/mis-citas', cita.appointmentId]);
  }

  reagendarCita(cita: Cita) {
    this.router.navigate(['/mis-citas', cita.appointmentId], { queryParams: { reagendar: true } });
  }

  cancelarCita(cita: Cita) {
    if (!confirm(`¿Seguro que deseas cancelar la cita ${cita.id}?`)) return;

    this.citasService.cancelarCita(cita.appointmentId).subscribe({
      next: () => this.cargarCitas(),
      error: () => alert('No se pudo cancelar la cita. Intenta nuevamente.'),
    });
  }

  getBadgeClass(estado: string) {
    return {
      'badge-proxima': estado === 'proxima',
      'badge-confirmada': estado === 'confirmada',
      'badge-completada': estado === 'completada',
      'badge-cancelada': estado === 'cancelada',
    };
  }

  getBadgeLabel(estado: string) {
    const labels: any = {
      proxima: 'Próxima',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return labels[estado] || estado;
  }
}
