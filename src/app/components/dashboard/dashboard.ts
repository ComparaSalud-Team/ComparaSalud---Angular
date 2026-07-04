import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProviderService } from '../../services/provider.service';
import { SpecialtyService } from '../../services/specialty.service';
import { Provider } from '../../models/provider.model';
import { Specialty } from '../../models/specialty';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;

  // Búsqueda rápida del hero — se conecta a /api/specialties/active y a los
  // distritos reales de /api/providers, y al buscar navega a /busqueda con
  // esos criterios como query params.
  busquedaRapida = {
    especialidad: '',
    ubicacion: '',
    fecha: '',
  };
  ubicacionesDisponibles: string[] = [];

  // Sugeridos para ti — se arman con /api/providers real, ordenados por rating.
  // No existe un endpoint de "recomendados" en el backend todavía,
  // así que esto es una aproximación (top-rated), no una recomendación real.
  sugeridos: Provider[] = [];
  cargandoSugeridos = true;
  errorSugeridos: string | null = null;

  // Explora por especialidad — /api/specialties/active
  especialidades: Specialty[] = [];
  cargandoEspecialidades = true;
  errorEspecialidades: string | null = null;

  private imagenesSugeridos = [
    'assets/images/doctor-card-1.png',
    'assets/images/doctor-card-2.png',
    'assets/images/doctor-card-3.png',
    'assets/images/doctor-card-4.png',
  ];

  // Diccionario de íconos existentes por palabra clave de especialidad.
  // Si el nombre real no matchea ninguna palabra clave, se usa icon-general.
  private iconosPorPalabraClave: { keyword: string; icon: string }[] = [
    { keyword: 'odont', icon: 'assets/icons/icon-odontologia.png' },
    { keyword: 'dent', icon: 'assets/icons/icon-odontologia.png' },
    { keyword: 'oftalmo', icon: 'assets/icons/icon-oftalmo.png' },
    { keyword: 'ojo', icon: 'assets/icons/icon-oftalmo.png' },
    { keyword: 'cardio', icon: 'assets/icons/icon-cardio.png' },
    { keyword: 'coraz', icon: 'assets/icons/icon-cardio.png' },
    { keyword: 'pediatr', icon: 'assets/icons/icon-pediatria.png' },
    { keyword: 'laborator', icon: 'assets/icons/icon-lab.png' },
    { keyword: 'analisis', icon: 'assets/icons/icon-lab.png' },
    { keyword: 'análisis', icon: 'assets/icons/icon-lab.png' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private providerService: ProviderService,
    private specialtyService: SpecialtyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
    this.cargarSugeridos();
    this.cargarEspecialidades();
    this.cargarUbicaciones();
  }

  cargarSugeridos(): void {
    this.cargandoSugeridos = true;
    this.errorSugeridos = null;

    this.providerService.getProviders().subscribe({
      next: (providers) => {
        this.sugeridos = [...(providers || [])]
          .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
          .slice(0, 4);
        this.cargandoSugeridos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorSugeridos = 'No se pudieron cargar los proveedores sugeridos.';
        this.cargandoSugeridos = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarEspecialidades(): void {
    this.cargandoEspecialidades = true;
    this.errorEspecialidades = null;

    this.specialtyService.listarActivas().subscribe({
      next: (data) => {
        this.especialidades = data || [];
        this.cargandoEspecialidades = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorEspecialidades = 'No se pudieron cargar las especialidades.';
        this.cargandoEspecialidades = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Distritos reales para el <select> "Ubicación" del buscador rápido.
  cargarUbicaciones(): void {
    this.providerService.getProviders().subscribe({
      next: (providers) => {
        this.ubicacionesDisponibles = Array.from(
          new Set((providers || []).map((p) => p.district).filter((d): d is string => !!d)),
        );
        this.cdr.detectChanges();
      },
      error: () => {
        // Si falla, el select de ubicación simplemente queda solo con "Todas".
      },
    });
  }

  buscar(): void {
    const queryParams: Record<string, string> = {};

    if (this.busquedaRapida.especialidad) {
      queryParams['especialidad'] = this.busquedaRapida.especialidad;
    }
    if (this.busquedaRapida.ubicacion) {
      queryParams['ubicacion'] = this.busquedaRapida.ubicacion;
    }
    if (this.busquedaRapida.fecha) {
      queryParams['fecha'] = this.busquedaRapida.fecha;
    }

    this.router.navigate(['/busqueda'], { queryParams });
  }

  imagenFor(index: number): string {
    return this.imagenesSugeridos[index % this.imagenesSugeridos.length];
  }

  iconoEspecialidad(specialty: Specialty): string {
    const nombre = (specialty.name || '').toLowerCase();
    const match = this.iconosPorPalabraClave.find((entry) => nombre.includes(entry.keyword));
    return match ? match.icon : 'assets/icons/icon-general.png';
  }

  ubicacionFor(provider: Provider): string {
    return [provider.district, provider.city].filter(Boolean).join(', ');
  }

  verPerfil(provider: Provider): void {
    // Nota: la ruta '/providers/:id' aún no existe en app.routes.ts.
    // Se navega igual para mantener consistencia con mis-favoritos.ts;
    // hay que crear esa página de detalle para que el botón funcione de verdad.
    this.router.navigate(['/providers', provider.id]);
  }

  buscarPorEspecialidad(specialty: Specialty): void {
    this.router.navigate(['/busqueda'], { queryParams: { especialidad: specialty.name } });
  }
}
