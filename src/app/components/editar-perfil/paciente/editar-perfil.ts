import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicNavbarComponent } from '../../../shared/public-navbar-paciente/public-navbar';
import { PublicFooterComponent } from '../../../shared/public-footer/footer';
import { PatientService } from '../../../services/patient';
import { AuthService } from '../../../services/auth';
import { Patient } from '../../../models/patient.model';

type Seccion = 'personal' | 'medica' | 'emergencia';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './editar-perfil.html',
  styleUrls: ['./editar-perfil.css'],
})
export class EditarPerfilComponent implements OnInit {
  seccionActiva: Seccion = 'personal';
  cargando = true;
  guardando = false;
  errorMsg = '';

  patient: Patient = {
    id: 0,
    authUserId: 0,
    name: '',
    phone: '',
    email: '',
    country: '',
    birthday: '',
    dni: '',
    estadoCivil: '',
    profesion: '',
    idiomaPreferido: '',
    direccion: '',
    genero: '',
    tipoSangre: '',
    alergias: '',
    condicionesMedicas: '',
    medicamentosActuales: '',
    seguroMedicoNombre: '',
    seguroMedicoPlan: '',
    emergenciaNombre: '',
    emergenciaParentesco: '',
    emergenciaTelefono: '',
    emergenciaDireccion: '',
  };

  avatar = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const seccion = this.route.snapshot.queryParamMap.get('seccion') as Seccion;
    if (seccion === 'personal' || seccion === 'medica' || seccion === 'emergencia') {
      this.seccionActiva = seccion;
    }

    this.patientService.getMyProfile().subscribe({
      next: (data: Patient) => {
        this.patient = { ...this.patient, ...data };
        this.avatar =
          (data as any)?.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(this.patient.name || 'U')}&background=0EA5E9&color=fff&size=128`;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando perfil', err);
        this.cargando = false;
      },
    });
  }

  get porcentajePerfil(): number {
    const campos = [
      this.patient.phone,
      this.patient.birthday,
      this.patient.dni,
      this.patient.estadoCivil,
      this.patient.profesion,
      this.patient.idiomaPreferido,
      this.patient.direccion,
      this.patient.genero,
      this.patient.emergenciaNombre,
      this.patient.emergenciaParentesco,
      this.patient.emergenciaTelefono,
    ];
    const llenos = campos.filter((v) => v && v.trim() !== '').length;
    return Math.round((llenos / campos.length) * 100);
  }

  irASeccion(seccion: Seccion): void {
    this.seccionActiva = seccion;
  }

  guardarCambios(): void {
    if (!this.patient.name || !this.patient.phone) {
      this.errorMsg = 'Nombre y teléfono son obligatorios.';
      return;
    }
    this.errorMsg = '';
    this.guardando = true;

    this.patientService.updatePatient(this.patient.id, this.patient).subscribe({
      next: (updated: Patient) => {
        this.guardando = false;
        const session = this.auth.getUser();
        if (session) {
          const merged = { ...session, profile: { ...session.profile, ...updated } };
          localStorage.setItem('cs_user', JSON.stringify(merged));
        }
        this.router.navigate(['/perfil/paciente']);
      },
      error: (err: any) => {
        this.guardando = false;
        this.errorMsg = err?.error?.message || 'No se pudo guardar los cambios.';
      },
    });
  }

  regresar(): void {
    this.router.navigate(['/perfil/paciente']);
  }
}
