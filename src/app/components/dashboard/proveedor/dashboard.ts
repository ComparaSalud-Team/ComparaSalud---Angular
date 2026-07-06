import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth';
import { MedicoService } from '../../../services/medico';
import { ProviderService } from '../../../services/provider.service';
import { ProviderDashboardDTO, RevenuePoint } from '../../../models/provider-dashboard.model';
import { Availability } from '../../../models/availability';
import { NavbarProveedorComponent } from '../../../shared/public-navbar-proveedor/public-navbar';
import { SidebarProveedorComponent } from '../../../shared/sidebar-proveedor/sidebar-proveedor';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';

@Component({
  selector: 'app-dashboard-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarProveedorComponent,
    SidebarProveedorComponent,
    PublicFooterComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  loading = true;
  error = false;

  dashboard: ProviderDashboardDTO | null = null;
  disponibilidadHoy: Availability[] = [];

  chartLinePath = '';
  chartAreaPath = '';
  chartLabels: string[] = [];

  private readonly CHART_WIDTH = 700;
  private readonly CHART_HEIGHT = 140;

  constructor(
    private auth: AuthService,
    private medicoService: MedicoService,
    private providerService: ProviderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const session = this.auth.getUser();
    this.user = session?.profile || session;

    this.medicoService
      .getMyProfile()
      .pipe(
        switchMap((profile) => {
          const today = this.todayStr();
          return forkJoin({
            dashboard: this.providerService.getMyDashboard(),
            availability: this.providerService.getAvailability(profile.id, today),
          });
        }),
        catchError((err) => {
          console.error('Error cargando dashboard:', err);
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.dashboard = result.dashboard;
          this.disponibilidadHoy = result.availability;
          this.buildRevenueChart(result.dashboard.revenueChart?.points || []);
        }
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
  }

  get displayName(): string {
    return this.user?.name || this.user?.fullName || this.user?.email || 'Usuario';
  }

  private todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  iniciales(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  badgeClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'CONFIRMED' || s === 'SCHEDULED') return 'badge-green';
    if (s === 'PENDING') return 'badge-yellow';
    return 'badge-blue';
  }

  estadoLabel(status: string): string {
    const s = (status || '').toUpperCase();
    const labels: Record<string, string> = {
      SCHEDULED: 'Programada',
      CONFIRMED: 'Confirmada',
      PENDING: 'Pendiente',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[s] || status;
  }

  get cancellationPct(): number {
    const rate = this.dashboard?.metrics?.cancellationRate ?? 0;
    return rate <= 1 ? rate * 100 : rate;
  }

  get attendancePct(): number {
    return this.dashboard?.metrics?.attendanceRate ?? 0;
  }

  get ratingPct(): number {
    const rating = this.dashboard?.metrics?.averageRating ?? 0;
    return (Number(rating) / 5) * 100;
  }

  get consultationMinutesPct(): number {
    const minutos = this.dashboard?.metrics?.averageConsultationMinutes;
    if (minutos === null || minutos === undefined) return 0;
    return Math.min((minutos / 90) * 100, 100);
  }

  deltaClass(delta: number | null | undefined): string {
    if (delta === null || delta === undefined) return '';
    return delta >= 0 ? 'up' : 'down';
  }

  formatDelta(delta: number | null | undefined): string {
    if (delta === null || delta === undefined) return '';
    const signo = delta > 0 ? '+' : '';
    return `${signo}${delta}%`;
  }

  estrellas(rating: number): boolean[] {
    const llenas = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => i < llenas);
  }

  private buildRevenueChart(points: RevenuePoint[]): void {
    this.chartLabels = points.map((p) => p.label);

    if (!points.length) {
      this.chartLinePath = '';
      this.chartAreaPath = '';
      return;
    }

    const amounts = points.map((p) => Number(p.amount) || 0);
    const max = Math.max(...amounts, 1);
    const stepX = points.length > 1 ? this.CHART_WIDTH / (points.length - 1) : 0;
    const topMargin = 10;
    const usableHeight = this.CHART_HEIGHT - topMargin;

    const coords = amounts.map((amount, i) => {
      const x = stepX * i;
      const y = topMargin + (usableHeight - (amount / max) * usableHeight);
      return { x, y };
    });

    this.chartLinePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    const first = coords[0];
    const last = coords[coords.length - 1];
    this.chartAreaPath =
      `M ${first.x.toFixed(1)} ${this.CHART_HEIGHT} ` +
      coords.map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ') +
      ` L ${last.x.toFixed(1)} ${this.CHART_HEIGHT} Z`;
  }
}
