import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';
import { Favorito } from '../../models/favorito';
import { FavoritoService } from '../../services/favorito.service';

@Component({
  selector: 'app-mis-favoritos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './mis-favoritos.html',
  styleUrl: './mis-favoritos.css',
})
export class MisFavoritosComponent implements OnInit {
  user: any = null;
  patientId: number | null = null;

  favoritos: Favorito[] = [];
  favoritosFiltrados: Favorito[] = [];

  cargando = true;
  error = '';

  busqueda = '';
  filtroZona = '';
  ordenarPor = '';

  // Los colores de las cabeceras de tarjeta se asignan en rotación, igual que en el mockup
  private gradientes = [
    'linear-gradient(135deg, #2563EB, #14B8A6)',
    'linear-gradient(135deg, #0EA5E9, #22C55E)',
    'linear-gradient(135deg, #6366F1, #06B6D4)',
  ];

  constructor(
    private auth: AuthService,
    private favoritoService: FavoritoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
    this.patientId = this.user?.id ?? null;

    if (!this.patientId) {
      this.error = 'No se pudo identificar al paciente. Vuelve a iniciar sesión.';
      this.cargando = false;
      return;
    }

    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.cargando = true;
    this.error = '';

    this.favoritoService.listarFavoritos(this.patientId!).subscribe({
      next: (data) => {
        this.favoritos = data || [];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus proveedores favoritos. Intenta nuevamente.';
        this.cargando = false;
      },
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.favoritos];

    if (this.busqueda.trim()) {
      const term = this.busqueda.trim().toLowerCase();
      resultado = resultado.filter(
        (f) =>
          f.fullName?.toLowerCase().includes(term) ||
          f.specialty?.toLowerCase().includes(term) ||
          f.city?.toLowerCase().includes(term) ||
          f.district?.toLowerCase().includes(term),
      );
    }

    if (this.filtroZona) {
      resultado = resultado.filter((f) => f.district === this.filtroZona);
    }

    if (this.ordenarPor === 'rating') {
      resultado.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    } else if (this.ordenarPor === 'precioAsc') {
      resultado.sort((a, b) => (a.pricePerAppointment ?? 0) - (b.pricePerAppointment ?? 0));
    } else if (this.ordenarPor === 'precioDesc') {
      resultado.sort((a, b) => (b.pricePerAppointment ?? 0) - (a.pricePerAppointment ?? 0));
    } else if (this.ordenarPor === 'nombre') {
      resultado.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }

    this.favoritosFiltrados = resultado;
  }

  get zonasDisponibles(): string[] {
    const zonas = this.favoritos.map((f) => f.district).filter((d): d is string => !!d);
    return Array.from(new Set(zonas));
  }

  gradienteFor(index: number): string {
    return this.gradientes[index % this.gradientes.length];
  }

  eliminarFavorito(favorito: Favorito, event: Event): void {
    event.stopPropagation();
    if (!this.patientId) return;

    this.favoritoService.eliminarFavorito(this.patientId, favorito.providerId).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter((f) => f.favoriteId !== favorito.favoriteId);
        this.aplicarFiltros();
      },
      error: () => {
        this.error = 'No se pudo eliminar este favorito. Intenta nuevamente.';
      },
    });
  }

  verServicios(favorito: Favorito): void {
    this.router.navigate(['/providers', favorito.providerId]);
  }
}
