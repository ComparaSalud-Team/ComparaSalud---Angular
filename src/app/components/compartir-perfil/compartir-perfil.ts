import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicNavbarComponent } from '../../shared/public-navbar-paciente/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

interface Campo {
  label: string;
  seleccionado: boolean;
  requerido: boolean;
}

interface CategoriaInfo {
  icon: string;
  iconColor: 'purple' | 'blue' | 'green' | 'orange';
  title: string;
  campos: Campo[];
}

interface Proveedor {
  id: number;
  nombre: string;
  ubicacion: string;
  icon: string;
  seleccionado: boolean;
}

@Component({
  selector: 'app-compartir-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './compartir-perfil.html',
  styleUrls: ['./compartir-perfil.css'],
})
export class CompartirPerfilComponent {
  constructor(private router: Router) {}

  busquedaProveedor = '';

  duracionSeleccionada = '30-dias';

  duracionOptions = [
    { label: '24 horas', value: '24-horas' },
    { label: '7 días', value: '7-dias' },
    { label: '30 días', value: '30-dias' },
    { label: 'Permanente (hasta que lo revoque)', value: 'permanente' },
  ];

  categorias: CategoriaInfo[] = [
    {
      icon: 'fa-regular fa-user',
      iconColor: 'purple',
      title: 'Datos Personales',
      campos: [
        { label: 'Nombre completo', seleccionado: true, requerido: true },
        { label: 'DNI', seleccionado: true, requerido: true },
        { label: 'Fecha de nacimiento', seleccionado: true, requerido: true },
        { label: 'Teléfono y correo electrónico', seleccionado: false, requerido: false },
        { label: 'Dirección', seleccionado: false, requerido: false },
      ],
    },
    {
      icon: 'fa-regular fa-file-lines',
      iconColor: 'blue',
      title: 'Historia Clínica',
      campos: [
        { label: 'Consultas anteriores', seleccionado: false, requerido: false },
        { label: 'Diagnósticos previos', seleccionado: false, requerido: false },
        { label: 'Tratamientos realizados', seleccionado: false, requerido: false },
        { label: 'Exámenes médicos y resultados', seleccionado: false, requerido: false },
        { label: 'Registro de vacunas', seleccionado: false, requerido: false },
      ],
    },
    {
      icon: 'fa-solid fa-wave-square',
      iconColor: 'green',
      title: 'Información de Salud Actual',
      campos: [
        { label: 'Alergias conocidas', seleccionado: false, requerido: false },
        { label: 'Medicamentos actuales', seleccionado: false, requerido: false },
        { label: 'Condiciones médicas crónicas', seleccionado: false, requerido: false },
        { label: 'Cirugías previas', seleccionado: false, requerido: false },
        { label: 'Grupo sanguíneo', seleccionado: false, requerido: false },
      ],
    },
    {
      icon: 'fa-regular fa-circle',
      iconColor: 'orange',
      title: 'Información de Seguro',
      campos: [
        { label: 'Nombre de aseguradora', seleccionado: false, requerido: false },
        { label: 'Número de póliza', seleccionado: false, requerido: false },
        { label: 'Detalles de cobertura', seleccionado: false, requerido: false },
      ],
    },
  ];

  proveedores: Proveedor[] = [
    {
      id: 1,
      nombre: 'Clínica Ricardo Palma',
      ubicacion: 'San Isidro',
      icon: 'fa-solid fa-hospital',
      seleccionado: false,
    },
    {
      id: 2,
      nombre: 'Hospital Rebagliati',
      ubicacion: 'Jesús María',
      icon: 'fa-solid fa-hospital',
      seleccionado: false,
    },
    {
      id: 3,
      nombre: 'Clínica San Felipe',
      ubicacion: 'San Isidro',
      icon: 'fa-solid fa-hospital',
      seleccionado: false,
    },
    {
      id: 4,
      nombre: 'Clínica Internacional',
      ubicacion: 'San Borja',
      icon: 'fa-solid fa-hospital',
      seleccionado: false,
    },
  ];

  get proveedoresFiltrados(): Proveedor[] {
    const q = this.busquedaProveedor.toLowerCase().trim();
    if (!q) return this.proveedores;
    return this.proveedores.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.ubicacion.toLowerCase().includes(q),
    );
  }

  toggleProveedor(p: Proveedor): void {
    p.seleccionado = !p.seleccionado;
  }

  toggleCampo(campo: Campo): void {
    if (campo.requerido) return;
    campo.seleccionado = !campo.seleccionado;
  }

  get camposSeleccionados(): number {
    return this.categorias.reduce(
      (total, cat) => total + cat.campos.filter((c) => c.seleccionado).length,
      0,
    );
  }

  get proveedoresSeleccionados(): number {
    return this.proveedores.filter((p) => p.seleccionado).length;
  }

  get duracionLabel(): string {
    return this.duracionOptions.find((d) => d.value === this.duracionSeleccionada)?.label || '';
  }

  compartirInformacion(): void {
    if (this.proveedoresSeleccionados === 0) {
      alert('Selecciona al menos un proveedor con quién compartir tu información.');
      return;
    }
    alert(
      `Se compartieron ${this.camposSeleccionados} campos con ${this.proveedoresSeleccionados} proveedor(es) por ${this.duracionLabel}.`,
    );
    this.router.navigate(['/perfil/paciente']);
  }

  cancelar(): void {
    this.busquedaProveedor = '';
    this.duracionSeleccionada = '30-dias';

    this.categorias.forEach((categoria) => {
      categoria.campos.forEach((campo) => {
        campo.seleccionado = campo.requerido;
      });
    });

    this.proveedores.forEach((proveedor) => {
      proveedor.seleccionado = false;
    });
  }
}
