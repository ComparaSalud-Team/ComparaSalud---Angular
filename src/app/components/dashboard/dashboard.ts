import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar';
import { PublicFooterComponent } from '../../shared/public-footer/footer';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const session = this.auth.getUser();
    this.user = session?.profile || session;
  }
}
