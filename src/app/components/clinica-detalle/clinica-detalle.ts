import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClinicService } from '../../services/clinic.service';
import { Clinic } from '../../models/clinic';
import { Provider } from '../../models/provider.model';
import { PublicNavbarComponent } from '../../shared/public-navbar-paciente/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

@Component({
  selector: 'app-clinica-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './clinica-detalle.html',
  styleUrl: './clinica-detalle.css',
})
export class ClinicaDetalleComponent implements OnInit {
  clinicId!: number;

  clinica: Clinic | null = null;
  cargandoClinica = true;
  errorClinica: string | null = null;

  medicos: Provider[] = [];
  cargandoMedicos = true;
  errorMedicos: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private clinicService: ClinicService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.clinicId = Number(idParam);

    if (!this.clinicId) {
      this.errorClinica = 'Clínica no válida.';
      this.cargandoClinica = false;
      this.cargandoMedicos = false;
      return;
    }

    this.cargarClinica();
    this.cargarMedicos();
  }

  cargarClinica(): void {
    this.cargandoClinica = true;
    this.errorClinica = null;

    this.clinicService.buscarPorId(this.clinicId).subscribe({
      next: (data) => {
        this.clinica = data;
        this.cargandoClinica = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorClinica = 'No se pudo cargar la información de esta clínica.';
        this.cargandoClinica = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarMedicos(): void {
    this.cargandoMedicos = true;
    this.errorMedicos = null;

    this.clinicService.verProveedores(this.clinicId).subscribe({
      next: (data) => {
        this.medicos = data || [];
        this.cargandoMedicos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMedicos = 'No se pudieron cargar los médicos de esta clínica.';
        this.cargandoMedicos = false;
        this.cdr.detectChanges();
      },
    });
  }

  ubicacion(): string {
    if (!this.clinica) return '';
    return [this.clinica.district, this.clinica.city].filter(Boolean).join(', ');
  }

  direccionCompleta(): string {
    if (!this.clinica) return '';
    return [this.clinica.street, this.clinica.district, this.clinica.city, this.clinica.country]
      .filter(Boolean)
      .join(', ');
  }

  volver(): void {
    this.location.back();
  }

  verPerfilMedico(medico: Provider): void {
    this.router.navigate(['/providers', medico.id]);
  }
}
