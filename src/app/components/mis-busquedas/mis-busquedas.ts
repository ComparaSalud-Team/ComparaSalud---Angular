import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';
import { BusquedaHistorial } from '../../models/busqueda-historial';
import { BusquedaHistorialService } from '../../services/busqueda-historial.service';

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

  // Iconos en rotación para los avatares circulares de cada tarjeta (igual que el mockup)
  private iconos = ['❤️', '👶', '🦷', '👁️', '🩺', '🏥'];

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

  // Si la búsqueda no tiene especialidad asociada (se hizo con texto libre,
  // sin elegir un filtro de categoría en /busqueda), usamos el keyword como
  // categoría de respaldo para que igual aparezca en el selector y se pueda filtrar.
  private categoriaDe(item: BusquedaHistorial): string {
    return item.specialty?.trim() || item.keyword?.trim() || '';
  }

  iconoFor(index: number): string {
    return this.iconos[index % this.iconos.length];
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
    this.router.navigate(['/buscar'], {
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

  guardarBusqueda(item: BusquedaHistorial, event: Event): void {
    event.stopPropagation();

    // Optimista: se marca al toque en la UI, sin esperar la respuesta del backend.
    item.saved = true;
    const seAgregoAGuardados = this.guardadosCargados && !this.guardados.some((g) => g.id === item.id);
    if (seAgregoAGuardados) {
      this.guardados = [item, ...this.guardados];
    }
    this.cdr.detectChanges();

    this.historialService.marcarComoGuardada(item.id).subscribe({
      error: () => {
        // Si falla, se revierte el cambio optimista.
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

    // Optimista: se quita al toque de la lista, sin esperar la respuesta del backend.
    const indiceOriginal = this.guardados.findIndex((g) => g.id === item.id);
    item.saved = false;
    this.guardados = this.guardados.filter((g) => g.id !== item.id);
    this.cdr.detectChanges();

    this.historialService.quitarDeGuardados(item.id).subscribe({
      error: () => {
        // Si falla, se revierte el cambio optimista.
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
