import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProviderService } from '../../services/provider.service';
import { SpecialtyService } from '../../services/specialty.service';
import { CitasService } from '../../services/citas';
import { MedicalServiceApiService } from '../../services/medical-service.service';
import { OfferService } from '../../services/offer.service';
import { Provider } from '../../models/provider.model';
import { Specialty } from '../../models/specialty';
import { AppointmentHistoryDTO } from '../../models/cita';
import { MedicalService } from '../../models/medical-service.model';
import { Offer } from '../../models/offer.model';
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

  // Próxima cita confirmada — /api/appointments/upcoming?userId=..., ya
  // ordenadas por fecha/hora ascendente en el backend; se toma la primera.
  proximaCita: AppointmentHistoryDTO | null = null;
  cargandoProximaCita = true;

  private readonly diasSemanaCortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  private readonly mesesCortos = [
    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
  ];
  private readonly mesesLargos = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  private readonly diasSemanaLargos = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
  ];

  // Servicios más solicitados — /api/services/active. Los íconos no vienen
  // del backend (el catálogo no los tiene), así que se asignan por palabra
  // clave del nombre real del servicio, igual que en iconoEspecialidad().
  servicios: MedicalService[] = [];
  cargandoServicios = true;
  errorServicios: string | null = null;
  servicioSeleccionado: MedicalService | null = null;

  private iconosPorPalabraClaveServicio: { keyword: string; icon: string }[] = [
    { keyword: 'vacun', icon: 'assets/icons/icon-vacuna.png' },
    { keyword: 'dent', icon: 'assets/icons/icon-diente.png' },
    { keyword: 'visual', icon: 'assets/icons/icon-ojo.png' },
    { keyword: 'ojo', icon: 'assets/icons/icon-ojo.png' },
    { keyword: 'cardio', icon: 'assets/icons/icon-corazon.png' },
    { keyword: 'coraz', icon: 'assets/icons/icon-corazon.png' },
    { keyword: 'rayos', icon: 'assets/icons/icon-rayos.png' },
    { keyword: 'radiograf', icon: 'assets/icons/icon-rayos.png' },
    { keyword: 'sangre', icon: 'assets/icons/icon-test.png' },
    { keyword: 'analisis', icon: 'assets/icons/icon-test.png' },
    { keyword: 'análisis', icon: 'assets/icons/icon-test.png' },
  ];

  // Ofertas exclusivas para ti — /api/offers/active. Cada oferta es un
  // descuento sobre un servicio real de catalog_services (ver OfferDTO en
  // el backend), no un precio inventado.
  ofertas: Offer[] = [];
  cargandoOfertas = true;
  errorOfertas: string | null = null;
  ofertaSeleccionada: Offer | null = null;

  private imagenesOfertas = [
    'assets/images/oferta1.png',
    'assets/images/oferta2.png',
    'assets/images/oferta3.png',
    'assets/images/oferta4.png',
    'assets/images/oferta5.png',
    'assets/images/oferta6.png',
  ];

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
    private citasService: CitasService,
    private medicalServiceApi: MedicalServiceApiService,
    private offerService: OfferService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
    this.cargarSugeridos();
    this.cargarEspecialidades();
    this.cargarUbicaciones();
    this.cargarProximaCita(session?.userId);
    this.cargarServicios();
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.cargandoOfertas = true;
    this.errorOfertas = null;

    this.offerService.listarActivas().subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas || [];
        this.cargandoOfertas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorOfertas = 'No se pudieron cargar las ofertas.';
        this.cargandoOfertas = false;
        this.cdr.detectChanges();
      },
    });
  }

  imagenOferta(index: number): string {
    return this.imagenesOfertas[index % this.imagenesOfertas.length];
  }

  abrirOferta(oferta: Offer): void {
    this.ofertaSeleccionada = oferta;
  }

  cerrarOferta(): void {
    this.ofertaSeleccionada = null;
  }

  cargarServicios(): void {
    this.cargandoServicios = true;
    this.errorServicios = null;

    this.medicalServiceApi.listarActivos().subscribe({
      next: (servicios) => {
        this.servicios = servicios || [];
        this.cargandoServicios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorServicios = 'No se pudieron cargar los servicios.';
        this.cargandoServicios = false;
        this.cdr.detectChanges();
      },
    });
  }

  iconoServicio(servicio: MedicalService): string {
    const nombre = (servicio.name || '').toLowerCase();
    const match = this.iconosPorPalabraClaveServicio.find((entry) => nombre.includes(entry.keyword));
    return match ? match.icon : 'assets/icons/icon-general.png';
  }

  abrirServicio(servicio: MedicalService): void {
    this.servicioSeleccionado = servicio;
  }

  cerrarServicio(): void {
    this.servicioSeleccionado = null;
  }

  cargarProximaCita(userId: number | undefined): void {
    if (!userId) {
      this.cargandoProximaCita = false;
      return;
    }

    this.cargandoProximaCita = true;
    this.citasService.obtenerProximas(userId).subscribe({
      next: (proximas) => {
        this.proximaCita = proximas?.[0] || null;
        this.cargandoProximaCita = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.proximaCita = null;
        this.cargandoProximaCita = false;
        this.cdr.detectChanges();
      },
    });
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

    this.router.navigate(['/busqueda-paciente'], { queryParams });
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
    this.router.navigate(['/busqueda-paciente'], { queryParams: { especialidad: specialty.name } });
  }

  fechaCorta(fecha: string): { dow: string; day: string; month: string } {
    const d = new Date(`${fecha}T00:00:00`);
    return {
      dow: this.diasSemanaCortos[d.getDay()],
      day: String(d.getDate()),
      month: this.mesesCortos[d.getMonth()],
    };
  }

  fechaLarga(fecha: string): string {
    const d = new Date(`${fecha}T00:00:00`);
    return `${d.getDate()} de ${this.mesesLargos[d.getMonth()]} del ${d.getFullYear()} ${this.diasSemanaLargos[d.getDay()]}`;
  }

  formatearHora(hora: string): string {
    const [h, m] = hora.split(':');
    const hNum = Number(h);
    const periodo = hNum >= 12 ? 'pm' : 'am';
    const hora12 = hNum % 12 === 0 ? 12 : hNum % 12;
    return `${hora12}:${m} ${periodo}`;
  }

  verDetallesCita(): void {
    if (!this.proximaCita) return;
    this.router.navigate(['/mis-citas', this.proximaCita.appointmentId]);
  }

  reagendarCitaDashboard(): void {
    if (!this.proximaCita) return;
    this.router.navigate(['/mis-citas', this.proximaCita.appointmentId], {
      queryParams: { reagendar: true },
    });
  }
}
