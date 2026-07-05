import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-proveedor',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-proveedor.html',
  styleUrls: ['./sidebar-proveedor.css'],
})
export class SidebarProveedorComponent {}
