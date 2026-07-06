import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class PublicFooterComponent {
  constructor(private auth: AuthService) {}

  dashboardRoute(): string {
    const rawRole = this.auth.getRole();
    const role = (rawRole ?? '').toString().trim().toLowerCase();

    const esProveedor = role.includes('provider') || role.includes('proveedor') || role === '2';
    const esPaciente = role.includes('patient') || role.includes('paciente') || role === '1';
    const esClinica = role.includes('clinic') || role.includes('clinica') || role === '4';
    const esAdmin = role.includes('admin') || role === '3';

    if (esProveedor) return '/dashboard/proveedor';
    if (esPaciente) return '/dashboard/paciente';
    if (esClinica) return '/dashboard/clinica';
    if (esAdmin) return '/dashboard/admin';

    return '/dashboard';
  }
}
