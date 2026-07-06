import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicFooterComponent } from '../../shared/public-footer/footer';
import { BusquedaHistorial } from '../../models/busqueda-historial';
import { BusquedaHistorialService } from '../../services/busqueda-historial.service';
import { PublicNavbarComponent } from '../../shared/public-navbar-paciente/public-navbar';

type Tab = 'historial' | 'guardados';

@Component({
  selector: 'app-mis-busquedas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './mis-busquedas.html',
  styleUrl: './mis-busquedas.css',
})
export class MisBusquedasComponent implements OnInit {
  tab: Tab = 'historial';

  historial: BusquedaHistorial[] = [];
  guardados: BusquedaHistorial[] = [];

  cargandoHistorial = true;
  cargandoGuardados = false;
  guardadosCargados = false;

  errorHistorial = '';
  errorGuardados = '';

  busqueda = '';
  categoria = '';

  constructor(
    private historialService: BusquedaHistorialService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cambiarTab(tab: Tab): void {
    this.tab = tab;
    this.busqueda = '';
    this.categoria = '';

    if (tab === 'guardados' && !this.guardadosCargados) {
      this.cargarGuardados();
    }
    this.cdr.detectChanges();
  }

  cargarHistorial(): void {
    this.cargandoHistorial = true;
    this.errorHistorial = '';

    this.historialService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial = data || [];
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorHistorial = 'No se pudo cargar tu historial de búsquedas.';
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarGuardados(): void {
    this.cargandoGuardados = true;
    this.errorGuardados = '';

    this.historialService.obtenerGuardados().subscribe({
      next: (data) => {
        this.guardados = data || [];
        this.cargandoGuardados = false;
        this.guardadosCargados = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorGuardados = 'No se pudo cargar tus búsquedas guardadas.';
        this.cargandoGuardados = false;
        this.cdr.detectChanges();
      },
    });
  }

  get listaActual(): BusquedaHistorial[] {
    const base = this.tab === 'historial' ? this.historial : this.guardados;
    let resultado = [...base];

    if (this.busqueda.trim()) {
      const term = this.busqueda.trim().toLowerCase();
      resultado = resultado.filter(
        (b) =>
          b.keyword?.toLowerCase().includes(term) ||
          b.specialty?.toLowerCase().includes(term) ||
          b.district?.toLowerCase().includes(term),
      );
    }

    if (this.categoria) {
      resultado = resultado.filter((b) => this.categoriaDe(b) === this.categoria);
    }

    return resultado;
  }

  get categoriasDisponibles(): string[] {
    const base = this.tab === 'historial' ? this.historial : this.guardados;
    const categorias = base.map((b) => this.categoriaDe(b)).filter((c): c is string => !!c);
    return Array.from(new Set(categorias));
  }

  private categoriaDe(item: BusquedaHistorial): string {
    return item.specialty || item.keyword || '';
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoria = '';
    this.cdr.detectChanges();
  }

  tiempoRelativo(fecha: string): string {
    if (!fecha) return '';
    const ahora = new Date().getTime();
    const entonces = new Date(fecha).getTime();
    const diffMs = ahora - entonces;
    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMs / 3600000);
    const dias = Math.floor(diffMs / 86400000);
    const semanas = Math.floor(dias / 7);
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} hora${horas === 1 ? '' : 's'}`;
    if (dias < 7) return `Hace ${dias} día${dias === 1 ? '' : 's'}`;
    return `Hace ${semanas} semana${semanas === 1 ? '' : 's'}`;
  }

  buscarNuevamente(item: BusquedaHistorial): void {
    this.router.navigate(['/busqueda-paciente'], {
      queryParams: {
        keyword: item.keyword,
        specialty: item.specialty,
        district: item.district,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        rating: item.rating,
      },
    });
  }

  toggleGuardado(item: BusquedaHistorial, event: Event): void {
    if (item.saved) {
      this.quitarDeGuardados(item, event);
    } else {
      this.guardarBusqueda(item, event);
    }
  }

  guardarBusqueda(item: BusquedaHistorial, event: Event): void {
    event.stopPropagation();
    item.saved = true;
    const seAgregoAGuardados =
      this.guardadosCargados && !this.guardados.some((g) => g.id === item.id);
    if (seAgregoAGuardados) {
      this.guardados = [item, ...this.guardados];
    }
    this.cdr.detectChanges();
    this.historialService.marcarComoGuardada(item.id).subscribe({
      error: () => {
        item.saved = false;
        if (seAgregoAGuardados) {
          this.guardados = this.guardados.filter((g) => g.id !== item.id);
        }
        this.errorHistorial = 'No se pudo guardar esta búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }

  quitarDeGuardados(item: BusquedaHistorial, event: Event): void {
    event.stopPropagation();
    const indiceOriginal = this.guardados.findIndex((g) => g.id === item.id);
    item.saved = false;
    this.guardados = this.guardados.filter((g) => g.id !== item.id);
    this.cdr.detectChanges();
    this.historialService.quitarDeGuardados(item.id).subscribe({
      error: () => {
        item.saved = true;
        const guardadosRevertidos = [...this.guardados];
        guardadosRevertidos.splice(indiceOriginal < 0 ? 0 : indiceOriginal, 0, item);
        this.guardados = guardadosRevertidos;
        this.errorGuardados = 'No se pudo quitar esta búsqueda de guardados.';
        this.cdr.detectChanges();
      },
    });
  }
}
