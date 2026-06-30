import { Component, OnInit } from '@angular/core';
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
  }

  cargarHistorial(): void {
    this.cargandoHistorial = true;
    this.errorHistorial = '';

    this.historialService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial = data || [];
        this.cargandoHistorial = false;
      },
      error: () => {
        this.errorHistorial = 'No se pudo cargar tu historial de búsquedas.';
        this.cargandoHistorial = false;
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
      },
      error: () => {
        this.errorGuardados = 'No se pudo cargar tus búsquedas guardadas.';
        this.cargandoGuardados = false;
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
      resultado = resultado.filter((b) => b.specialty === this.categoria);
    }

    return resultado;
  }

  get categoriasDisponibles(): string[] {
    const base = this.tab === 'historial' ? this.historial : this.guardados;
    const categorias = base.map((b) => b.specialty).filter((c): c is string => !!c);
    return Array.from(new Set(categorias));
  }

  iconoFor(index: number): string {
    return this.iconos[index % this.iconos.length];
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoria = '';
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
    this.historialService.marcarComoGuardada(item.id).subscribe({
      next: () => {
        item.saved = true;
        if (this.guardadosCargados) {
          this.guardados = [item, ...this.guardados];
        }
      },
      error: () => {
        this.errorHistorial = 'No se pudo guardar esta búsqueda.';
      },
    });
  }

  quitarDeGuardados(item: BusquedaHistorial, event: Event): void {
    event.stopPropagation();
    this.historialService.quitarDeGuardados(item.id).subscribe({
      next: () => {
        item.saved = false;
        this.guardados = this.guardados.filter((g) => g.id !== item.id);
      },
      error: () => {
        this.errorGuardados = 'No se pudo quitar esta búsqueda de guardados.';
      },
    });
  }
}
