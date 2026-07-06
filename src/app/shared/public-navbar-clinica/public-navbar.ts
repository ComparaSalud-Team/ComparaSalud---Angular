import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar-clinica',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-navbar.html',
  styleUrls: ['./public-navbar.css'],
})
export class NavbarClinicaComponent implements OnInit {
  user: any = null;
  dropdownOpen = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-wrapper')) {
      this.dropdownOpen = false;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get displayName(): string {
    return this.user?.name || this.user?.fullName || this.user?.email || 'Clínica';
  }

  get avatarUrl(): string {
    const photo = this.user?.photoUrl || this.user?.profilePhotoUrl;
    if (photo) return photo;
    const name = encodeURIComponent(this.displayName);
    return `https://ui-avatars.com/api/?name=${name}&background=0EA5E9&color=fff&size=128`;
  }
}
