import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarProveedorComponent } from '../../../shared/public-navbar-proveedor/public-navbar';
import { SidebarProveedorComponent } from '../../../shared/sidebar-proveedor/sidebar-proveedor';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';
import { MedicoService } from '../../../services/medico';
import { AuthService } from '../../../services/auth';
import { Provider, EducationItem, ProviderMedicalService } from '../../../models/provider.model';

type Seccion =
  | 'profesional'
  | 'ubicacion'
  | 'precios'
  | 'educacion'
  | 'certificaciones'
  | 'servicios'
  | 'horario';

@Component({
  selector: 'app-editar-perfil-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarProveedorComponent,
    SidebarProveedorComponent,
    PublicFooterComponent,
  ],
  templateUrl: './editar-perfil.html',
  styleUrls: ['./editar-perfil.css'],
})
export class EditarPerfilComponent implements OnInit {
  seccionActiva: Seccion = 'profesional';
  cargando = true;
  guardando = false;
  errorMsg = '';

  provider: Provider = {
    id: 0,
    authUserId: 0,
    fullName: '',
    phone: '',
    email: '',
    specialty: '',
    description: '',
    isValidated: false,
    pricePerAppointment: 0,
    rating: 0,
    averageRating: 0,
    experienceYears: 0,
    language: '',
    modality: '',
    street: '',
    district: '',
    city: '',
    country: '',
    cedulaProfesional: '',
    registroMedico: '',
    areasEnfoque: [],
    certificaciones: [],
    horario: [],
    educacion: [],
    precios: [],
    services: [],
  };

  avatar = '';

  // Buffers para agregar items a las listas simples
  nuevaAreaEnfoque = '';
  nuevaCertificacion = '';

  // Idiomas: select + lista de tags
  nuevoIdioma = '';
  idiomasSeleccionados: string[] = [];

  // Especialidades: select + lista de tags
  nuevaEspecialidad = '';
  especialidadesSeleccionadas: string[] = [];

  // Horario: selector de días + hora inicio/fin
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diasSeleccionados: string[] = [];
  horaInicio = '';
  horaFin = '';
  horarioError = '';

  // Precios: lista de nombre + monto
  nuevoPrecioNombre = '';
  nuevoPrecioMonto: number | null = null;

  // Catálogo de servicios disponibles y sus IDs seleccionados
  catalogoServicios: ProviderMedicalService[] = [];
  serviciosSeleccionados: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicoService: MedicoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const seccion = this.route.snapshot.queryParamMap.get('seccion') as Seccion;
    const seccionesValidas: Seccion[] = [
      'profesional',
      'ubicacion',
      'precios',
      'educacion',
      'certificaciones',
      'servicios',
      'horario',
    ];
    if (seccionesValidas.includes(seccion)) {
      this.seccionActiva = seccion;
    }

    this.medicoService.getMyProfile().subscribe({
      next: (data: Provider) => {
        this.provider = { ...this.provider, ...data };
        this.provider.precios = [...(data.precios || [])].sort((a, b) => a.monto - b.monto);
        this.serviciosSeleccionados = (data.services || []).map((s) => s.id);
        this.idiomasSeleccionados = data.language
          ? data.language
              .split(',')
              .map((l) => l.trim())
              .filter(Boolean)
          : [];
        this.especialidadesSeleccionadas = data.specialty
          ? data.specialty
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        this.avatar =
          (data as any)?.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(this.provider.fullName || 'Doctor')}&background=0EA5E9&color=fff&size=128`;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando perfil', err);
        this.cargando = false;
      },
    });

    this.medicoService.getCatalogoServicios().subscribe({
      next: (servicios) => (this.catalogoServicios = servicios),
      error: (err) => console.error('Error cargando catálogo de servicios', err),
    });
  }

  irASeccion(seccion: Seccion): void {
    this.seccionActiva = seccion;
  }

  soloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtrado = input.value.replace(/\D/g, '').slice(0, 9);
    if (filtrado !== input.value) {
      input.value = filtrado;
    }
    this.provider.phone = filtrado;
  }

  porcentajePerfil(): number {
    const checks = [
      !!this.provider.fullName?.trim(),
      !!this.provider.phone?.trim(),
      this.especialidadesSeleccionadas.length > 0,
      !!this.provider.experienceYears,
      this.idiomasSeleccionados.length > 0,
      !!this.provider.modality,
      !!this.provider.cedulaProfesional?.trim(),
      !!this.provider.registroMedico?.trim(),
      this.provider.areasEnfoque.length > 0,
      !!this.provider.description?.trim(),
      !!this.provider.street?.trim() && !!this.provider.city?.trim(),
      this.provider.precios.length > 0,
      this.provider.educacion.length > 0,
      this.provider.certificaciones.length > 0,
      this.serviciosSeleccionados.length > 0,
      this.provider.horario.length > 0,
    ];

    const completados = checks.filter(Boolean).length;
    return Math.round((completados / checks.length) * 100);
  }

  // ── Listas simples: áreas de enfoque, certificaciones ──
  agregarAreaEnfoque(): void {
    if (this.nuevaAreaEnfoque.trim()) {
      this.provider.areasEnfoque.push(this.nuevaAreaEnfoque.trim());
      this.nuevaAreaEnfoque = '';
    }
  }
  quitarAreaEnfoque(index: number): void {
    this.provider.areasEnfoque.splice(index, 1);
  }

  agregarCertificacion(): void {
    if (this.nuevaCertificacion.trim()) {
      this.provider.certificaciones.push(this.nuevaCertificacion.trim());
      this.nuevaCertificacion = '';
    }
  }
  quitarCertificacion(index: number): void {
    this.provider.certificaciones.splice(index, 1);
  }

  // ── Horario (selector de días + hora inicio/fin) ──
  toggleDia(dia: string): void {
    const idx = this.diasSeleccionados.indexOf(dia);
    if (idx === -1) {
      this.diasSeleccionados.push(dia);
    } else {
      this.diasSeleccionados.splice(idx, 1);
    }
  }

  agregarHorario(): void {
    if (!this.diasSeleccionados.length || !this.horaInicio || !this.horaFin) {
      this.horarioError = 'Selecciona al menos un día y ambas horas.';
      return;
    }
    if (this.horaFin <= this.horaInicio) {
      this.horarioError = 'La hora de fin debe ser posterior a la hora de inicio.';
      return;
    }
    this.horarioError = '';

    // Ordena los días seleccionados según el orden natural de la semana
    const ordenados = this.diasSemana.filter((d) => this.diasSeleccionados.includes(d));
    const bloque = `${ordenados.join(', ')}: ${this.horaInicio} - ${this.horaFin}`;
    this.provider.horario.push(bloque);

    // Reinicia el formulario para agregar otro bloque
    this.diasSeleccionados = [];
    this.horaInicio = '';
    this.horaFin = '';
  }

  quitarHorario(index: number): void {
    this.provider.horario.splice(index, 1);
  }

  // ── Idiomas (select + tags) ──
  agregarIdioma(): void {
    if (this.nuevoIdioma && !this.idiomasSeleccionados.includes(this.nuevoIdioma)) {
      this.idiomasSeleccionados.push(this.nuevoIdioma);
      this.nuevoIdioma = '';
    }
  }
  quitarIdioma(index: number): void {
    this.idiomasSeleccionados.splice(index, 1);
  }

  // ── Especialidades (select + tags) ──
  agregarEspecialidad(): void {
    if (
      this.nuevaEspecialidad &&
      !this.especialidadesSeleccionadas.includes(this.nuevaEspecialidad)
    ) {
      this.especialidadesSeleccionadas.push(this.nuevaEspecialidad);
      this.nuevaEspecialidad = '';
    }
  }
  quitarEspecialidad(index: number): void {
    this.especialidadesSeleccionadas.splice(index, 1);
  }

  // ── Precios (lista de nombre + monto) ──
  agregarPrecio(): void {
    if (
      this.nuevoPrecioNombre.trim() &&
      this.nuevoPrecioMonto !== null &&
      this.nuevoPrecioMonto > 0
    ) {
      this.provider.precios.push({
        nombre: this.nuevoPrecioNombre.trim(),
        monto: this.nuevoPrecioMonto,
      });
      this.provider.precios.sort((a, b) => a.monto - b.monto);
      this.nuevoPrecioNombre = '';
      this.nuevoPrecioMonto = null;
    }
  }
  quitarPrecio(index: number): void {
    this.provider.precios.splice(index, 1);
  }

  // ── Educación (lista de objetos) ──
  agregarEducacion(): void {
    this.provider.educacion.push({ titulo: '', institucion: '', periodo: '', detalle: '' });
  }
  quitarEducacion(index: number): void {
    this.provider.educacion.splice(index, 1);
  }

  // ── Servicios (checkbox contra el catálogo) ──
  toggleServicio(id: number): void {
    const idx = this.serviciosSeleccionados.indexOf(id);
    if (idx === -1) {
      this.serviciosSeleccionados.push(id);
    } else {
      this.serviciosSeleccionados.splice(idx, 1);
    }
  }
  servicioEstaSeleccionado(id: number): boolean {
    return this.serviciosSeleccionados.includes(id);
  }

  validarFormulario(): boolean {
    const nombre = this.provider.fullName?.trim() || '';
    if (!nombre) {
      this.errorMsg = 'El nombre completo es obligatorio.';
      return false;
    }
    if (nombre.length < 3) {
      this.errorMsg = 'El nombre completo debe tener al menos 3 caracteres.';
      return false;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
      this.errorMsg = 'El nombre completo solo puede contener letras y espacios.';
      return false;
    }

    const telefono = this.provider.phone?.trim() || '';
    if (!telefono) {
      this.errorMsg = 'El teléfono es obligatorio.';
      return false;
    }
    if (!/^\d{9}$/.test(telefono)) {
      this.errorMsg = 'El teléfono debe tener exactamente 9 dígitos numéricos.';
      return false;
    }

    if (
      this.provider.experienceYears !== null &&
      this.provider.experienceYears !== undefined &&
      (this.provider.experienceYears < 0 || this.provider.experienceYears > 70)
    ) {
      this.errorMsg = 'Los años de experiencia deben estar entre 0 y 70.';
      return false;
    }

    if (
      this.provider.cedulaProfesional &&
      !/^[A-Za-z0-9\s-]+$/.test(this.provider.cedulaProfesional)
    ) {
      this.errorMsg =
        'La cédula profesional solo puede contener letras, números, espacios y guiones.';
      return false;
    }

    if (this.provider.registroMedico && !/^[A-Za-z0-9\s-]+$/.test(this.provider.registroMedico)) {
      this.errorMsg = 'El registro médico solo puede contener letras, números, espacios y guiones.';
      return false;
    }

    if (this.provider.precios.some((p) => !p.nombre.trim() || p.monto <= 0)) {
      this.errorMsg = 'Todos los precios deben tener nombre y un monto mayor a 0.';
      return false;
    }

    if (
      this.provider.educacion.some(
        (e) => !e.titulo.trim() || !e.institucion.trim() || !e.periodo.trim(),
      )
    ) {
      this.errorMsg = 'Completa título, institución y período en cada registro de educación.';
      return false;
    }

    this.errorMsg = '';
    return true;
  }

  guardarCambios(): void {
    if (!this.validarFormulario()) {
      return;
    }
    this.guardando = true;

    this.provider.language = this.idiomasSeleccionados.join(', ');
    this.provider.specialty = this.especialidadesSeleccionadas.join(', ');

    // El precio base que usa el dashboard para calcular ingresos se toma
    // automáticamente como el más bajo de la lista de precios (si existe alguno).
    if (this.provider.precios.length) {
      this.provider.pricePerAppointment = Math.min(...this.provider.precios.map((p) => p.monto));
    }

    this.medicoService.updateProvider(this.provider.id, this.provider).subscribe({
      next: () => {
        // Guarda los servicios seleccionados en una segunda llamada
        this.medicoService
          .updateProviderServices(this.provider.id, this.serviciosSeleccionados)
          .subscribe({
            next: (updated: Provider) => {
              this.guardando = false;
              const session = this.auth.getUser();
              if (session) {
                const merged = { ...session, profile: { ...session.profile, ...updated } };
                localStorage.setItem('cs_user', JSON.stringify(merged));
              }
              this.router.navigate(['/perfil/proveedor']);
            },
            error: (err: any) => {
              this.guardando = false;
              this.errorMsg = err?.error?.message || 'No se pudieron guardar los servicios.';
            },
          });
      },
      error: (err: any) => {
        this.guardando = false;
        this.errorMsg = err?.error?.message || 'No se pudo guardar los cambios.';
      },
    });
  }

  regresar(): void {
    this.router.navigate(['/perfil/proveedor']);
  }
}
