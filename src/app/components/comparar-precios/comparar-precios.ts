import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

import { ClinicService } from '../../services/clinic.service';
import { ClinicSpecialtyPrice } from '../../models/clinic-specialty-price';

interface GrupoEspecialidad {
  especialidad: string;
  desde: number;
  filas: ClinicSpecialtyPrice[];
}

// "Comparar consultas" (tarjeta del dashboard). Agrupa el mismo dato de
// ClinicSpecialtyPrice que usa /comparar-proveedores, pero pivotado por
// especialidad en vez de por clínica.
@Component({
  selector: 'app-comparar-precios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './comparar-precios.html',
  styleUrl: './comparar-precios.css',
})
export class CompararPreciosComponent implements OnInit {
  cargando = true;
  error: string | null = null;

  todasLasFilas: ClinicSpecialtyPrice[] = [];
  grupos: GrupoEspecialidad[] = [];
  clinicasDisponibles: string[] = [];

  busqueda = '';
  filtroClinica = '';
  ordenPrecio: '' | 'asc' | 'desc' = '';

  constructor(
    private clinicService: ClinicService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPrecios();
  }

  cargarPrecios(): void {
    this.cargando = true;
    this.error = null;

    this.clinicService.compararPrecios().subscribe({
      next: (filas) => {
        this.todasLasFilas = filas;
        this.clinicasDisponibles = Array.from(new Set(filas.map((f) => f.clinicName))).sort();
        this.construirGrupos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los precios.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private construirGrupos(): void {
    const q = this.busqueda.toLowerCase().trim();

    const filtradas = this.todasLasFilas.filter((f) => {
      const coincideTexto = !q || f.specialty.toLowerCase().includes(q);
      const coincideClinica = !this.filtroClinica || f.clinicName === this.filtroClinica;
      return coincideTexto && coincideClinica;
    });

    const porEspecialidad = new Map<string, ClinicSpecialtyPrice[]>();
    filtradas.forEach((fila) => {
      const lista = porEspecialidad.get(fila.specialty) || [];
      lista.push(fila);
      porEspecialidad.set(fila.specialty, lista);
    });

    this.grupos = Array.from(porEspecialidad.entries())
      .map(([especialidad, filas]) => {
        const ordenadas = [...filas].sort((a, b) =>
          this.ordenPrecio === 'desc' ? b.price - a.price : a.price - b.price,
        );
        return {
          especialidad,
          desde: Math.min(...filas.map((f) => f.price)),
          filas: ordenadas,
        };
      })
      .sort((a, b) => a.especialidad.localeCompare(b.especialidad));
  }

  aplicarFiltros(): void {
    this.construirGrupos();
  }

  agendar(fila: ClinicSpecialtyPrice): void {
    this.router.navigate(['/busqueda-paciente'], {
      queryParams: { especialidad: fila.specialty, ubicacion: fila.district },
    });
  }
}
