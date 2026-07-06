import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth';
import { ClinicService } from '../../../services/clinic.service';
import {
  ClinicDashboardDTO,
  ClinicDepartment,
  ClinicRevenuePoint,
} from '../../../models/clinic-dashboard.model';
import { NavbarClinicaComponent } from '../../../shared/public-navbar-clinica/public-navbar';
import { SidebarClinicaComponent } from '../../../shared/sidebar-clinica/sidebar-clinica';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';

@Component({
  selector: 'app-dashboard-clinica',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarClinicaComponent,
    SidebarClinicaComponent,
    PublicFooterComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  loading = true;
  error = false;

  dashboard: ClinicDashboardDTO | null = null;

  chartLinePath = '';
  chartAreaPath = '';
  chartLabels: string[] = [];

  private readonly CHART_WIDTH = 700;
  private readonly CHART_HEIGHT = 140;
  private readonly DEPT_COLORS = ['blue', 'green', 'purple', 'orange'];

  constructor(
    private auth: AuthService,
    private clinicService: ClinicService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const session = this.auth.getUser();
    this.user = session?.profile || session;

    const clinicId = this.user?.id;

    this.clinicService
      .getDashboard(clinicId)
      .pipe(
        catchError((err) => {
          console.error('Error cargando dashboard de clínica:', err);
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.dashboard = result;
          this.buildRevenueChart(result.revenueChart?.points || []);
        }
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
  }

  get displayName(): string {
    return this.user?.name || this.user?.fullName || this.user?.email || 'Clínica';
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

  deptPct(dept: ClinicDepartment): number {
    if (!dept.capacity) return 0;
    return Math.min((dept.currentPatients / dept.capacity) * 100, 100);
  }

  deptColor(index: number): string {
    return this.DEPT_COLORS[index % this.DEPT_COLORS.length];
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

  private buildRevenueChart(points: ClinicRevenuePoint[]): void {
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
