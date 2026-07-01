import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
    return this.citas.filter(
      (c) =>
        c.estado === this.tabActivo || (this.tabActivo === 'proximas' && c.estado === 'proxima'),
    );
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
      return;
    }

    this.cargando = true;
    this.error = null;

    this.citasService.obtenerHistorial(userId).subscribe({
      next: (historial: AppointmentHistoryDTO[]) => {
        this.citas = historial.map((h) => this.mapearCita(h));
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 404) {
          // Backend responde 404 cuando el paciente aún no tiene citas registradas
          this.citas = [];
        } else {
          this.error = 'No se pudieron cargar tus citas. Intenta nuevamente.';
        }
      },
    });
  }

  private mapearCita(h: AppointmentHistoryDTO): Cita {
    return {
      id: `APT-${h.appointmentId}`,
      appointmentId: h.appointmentId,
      doctorNombre: h.doctor,
      doctorImagen: 'assets/images/doctor-card-1.png',
      especialidad: '',
      calificacion: 0,
      fecha: h.date,
      hora: h.time,
      duracionMin: 0,
      ubicacion: '',
      estado: this.mapearEstado(h.status),
      precio: 0,
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
