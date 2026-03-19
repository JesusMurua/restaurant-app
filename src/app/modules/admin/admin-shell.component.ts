import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AdminAuthService } from '../../core/services/admin-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {

  constructor(
    private readonly authService: AdminAuthService,
    private readonly router: Router,
  ) {}

  /** Logs out and returns to the POS */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/pos']);
  }

}
