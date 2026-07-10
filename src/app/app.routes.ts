import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro-paso1/registro-paso1').then((m) => m.RegistroPaso1Component),
  },
  {
    path: 'registro-paso2',
    loadComponent: () =>
      import('./components/registro-paso2/registro-paso2').then((m) => m.RegistroPaso2Component),
  },

  {
    path: 'registro-doctor',
    loadComponent: () =>
      import('./components/registro-doctor/registro-doctor').then((m) => m.RegistroDoctorComponent),
  },
  {
    path: 'registro-clinica',
    loadComponent: () =>
      import('./components/registro-clinica/registro-clinica').then(
        (m) => m.RegistroClinicaComponent,
      ),
  },

  {
    path: 'busqueda',
    loadComponent: () =>
      import('./components/busqueda-medicos/busqueda-medicos').then(
        (m) => m.BusquedaMedicosComponent,
      ),
  },

  {
    path: 'busqueda-paciente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/busqueda-paciente/busqueda-paciente').then(
        (m) => m.BusquedaPacienteComponent,
      ),
  },

  {
    path: 'dashboard',
    redirectTo: 'dashboard/paciente',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/paciente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/paciente/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'dashboard/proveedor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/proveedor/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'dashboard/clinica',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/clinica/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'mis-citas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mis-citas/paciente/mis-citas').then((m) => m.MisCitasComponent),
  },
  {
    path: 'mis-citas/paciente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mis-citas/paciente/mis-citas').then((m) => m.MisCitasComponent),
  },
  {
    path: 'mis-citas/proveedor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mis-citas/proveedor/mis-citas').then((m) => m.MisCitasComponent),
  },
  {
    path: 'mis-citas/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/cita-detalle/cita-detalle').then((m) => m.CitaDetalleComponent),
  },
  {
    path: 'perfil/paciente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/perfil/paciente/perfil').then((m) => m.PerfilComponent),
  },
  {
    path: 'perfil/proveedor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/perfil/proveedor/perfil').then((m) => m.PerfilComponent),
  },
  {
    path: 'perfil/clinica',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/perfil/clinica/perfil').then((m) => m.PerfilComponent),
  },

  {
    path: 'editar-perfil/paciente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/editar-perfil/paciente/editar-perfil').then(
        (m) => m.EditarPerfilComponent,
      ),
  },
  {
    path: 'editar-perfil/proveedor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/editar-perfil/proveedor/editar-perfil').then(
        (m) => m.EditarPerfilComponent,
      ),
  },
  {
    path: 'editar-perfil/clinica',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/editar-perfil/clinica/editar-perfil').then(
        (m) => m.EditarPerfilComponent,
      ),
  },

  {
    path: 'compartir-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/compartir-perfil/compartir-perfil').then(
        (m) => m.CompartirPerfilComponent,
      ),
  },
  {
    path: 'favoritos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mis-favoritos/mis-favoritos').then((m) => m.MisFavoritosComponent),
  },

  {
    path: 'mis-busquedas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mis-busquedas/mis-busquedas').then((m) => m.MisBusquedasComponent),
  },
  {
    path: 'comparar-proveedores',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/comparar-proveedores/comparar-proveedores').then(
        (m) => m.CompararProveedoresComponent,
      ),
  },
  {
    path: 'comparar-precios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/comparar-precios/comparar-precios').then(
        (m) => m.CompararPreciosComponent,
      ),
  },

  {
    path: 'clinicas/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/clinica-detalle/clinica-detalle').then((m) => m.ClinicaDetalleComponent),
  },

  {
    path: 'providers/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/provider-perfil/provider-perfil').then((m) => m.ProviderPerfilComponent),
  },

  // HU33 – Agendar cita con un proveedor puntual. El invitado que intenta
  {
    path: 'agendar-cita/:providerId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/agendar-cita/agendar-cita').then((m) => m.AgendarCitaComponent),
  },

  { path: 'buscar', redirectTo: 'busqueda-paciente', pathMatch: 'full' },
  { path: 'documentos', redirectTo: 'mis-busquedas', pathMatch: 'full' },
  {
    path: 'configuracion',
    redirectTo: 'configuracion/paciente',
    pathMatch: 'full',
  },
  {
    path: 'configuracion/paciente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/configuracion/paciente/configuracion').then(
        (m) => m.ConfiguracionComponent,
      ),
  },
  {
    path: 'configuracion/proveedor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/configuracion/proveedor/configuracion').then(
        (m) => m.ConfiguracionComponent,
      ),
  },
  {
    path: 'configuracion/clinica',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/configuracion/clinica/configuracion').then(
        (m) => m.ConfiguracionComponent,
      ),
  },

  { path: '**', redirectTo: 'home' },
];
