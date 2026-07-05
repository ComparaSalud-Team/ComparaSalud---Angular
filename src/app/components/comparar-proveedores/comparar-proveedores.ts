import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PublicNavbarComponent } from '../../shared/public-navbar-paciente/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

import { ClinicService } from '../../services/clinic.service';
import { Clinic } from '../../models/clinic';
import { ClinicSpecialtyPrice } from '../../models/clinic-specialty-price';

interface FilaPrecio {
  especialidad: string;
  porClinica: Record<number, number | null>;
}
@Component({
  selector: 'app-comparar-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './comparar-proveedores.html',
  styleUrl: './comparar-proveedores.css',
})
export class CompararProveedoresComponent implements OnInit {
  cargando = true;
  error: string | null = null;

  todasLasClinicas: Clinic[] = [];
  clinicasFiltradas: Clinic[] = [];
  preciosPorClinica: Record<number, ClinicSpecialtyPrice[]> = {};
  filasPrecio: FilaPrecio[] = [];

  distritosDisponibles: string[] = [];

  busqueda = '';
  filtroZona = '';
  filtroCalificacion = '';

  constructor(
    private clinicService: ClinicService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarClinicas();
  }

  cargarClinicas(): void {
    this.cargando = true;
    this.error = null;

    this.clinicService.listarActivas().subscribe({
      next: (clinicas) => {
        this.todasLasClinicas = clinicas;
        this.distritosDisponibles = Array.from(
          new Set(clinicas.map((c) => c.district).filter((d): d is string => !!d)),
        );
        this.aplicarFiltros();
        this.cargarPrecios();
      },
      error: () => {
        this.error = 'No se pudieron cargar las clínicas.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private cargarPrecios(): void {
    if (this.clinicasFiltradas.length === 0) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    let pendientes = this.clinicasFiltradas.length;
    this.preciosPorClinica = {};

    this.clinicasFiltradas.forEach((clinica) => {
      this.clinicService.preciosDeClinica(clinica.id).subscribe({
        next: (precios) => {
          this.preciosPorClinica[clinica.id] = precios;
          pendientes--;
          if (pendientes === 0) {
            this.construirFilasPrecio();
            this.cargando = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.preciosPorClinica[clinica.id] = [];
          pendientes--;
          if (pendientes === 0) {
            this.construirFilasPrecio();
            this.cargando = false;
            this.cdr.detectChanges();
          }
        },
      });
    });
  }

  private construirFilasPrecio(): void {
    const especialidades = new Set<string>();
    Object.values(this.preciosPorClinica).forEach((lista) =>
      lista.forEach((p) => especialidades.add(p.specialty)),
    );

    this.filasPrecio = Array.from(especialidades)
      .sort((a, b) => a.localeCompare(b))
      .map((especialidad) => {
        const porClinica: Record<number, number | null> = {};
        this.clinicasFiltradas.forEach((clinica) => {
          const encontrado = (this.preciosPorClinica[clinica.id] || []).find(
            (p) => p.specialty === especialidad,
          );
          porClinica[clinica.id] = encontrado ? encontrado.price : null;
        });
        return { especialidad, porClinica };
      });
  }

  aplicarFiltros(): void {
    const q = this.busqueda.toLowerCase().trim();

    this.clinicasFiltradas = this.todasLasClinicas.filter((c) => {
      const coincideTexto = !q || c.name.toLowerCase().includes(q);
      const coincideZona = !this.filtroZona || c.district === this.filtroZona;
      const coincideCalificacion =
        !this.filtroCalificacion || Number(c.rating) >= Number(this.filtroCalificacion);
      return coincideTexto && coincideZona && coincideCalificacion;
    });

    this.cargarPrecios();
  }

  verDisponibilidad(clinica: Clinic): void {
    this.router.navigate(['/busqueda-paciente'], {
      queryParams: { ubicacion: clinica.district },
    });
  }
}
