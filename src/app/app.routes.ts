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
    path: 'busqueda',
    loadComponent: () =>
      import('./components/busqueda-medicos/busqueda-medicos').then(
        (m) => m.BusquedaMedicosComponent,
      ),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'mis-citas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mis-citas/mis-citas').then((m) => m.MisCitasComponent),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./components/perfil/perfil').then((m) => m.PerfilComponent),
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
  { path: 'buscar', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'documentos', redirectTo: 'mis-busquedas', pathMatch: 'full' },
  { path: 'configuracion', redirectTo: 'perfil', pathMatch: 'full' },

  { path: '**', redirectTo: 'home' },
];
