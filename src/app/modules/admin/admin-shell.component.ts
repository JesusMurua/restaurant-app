import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  /** Navigates to the POS without logging out */
  goToPos(): void {
    this.router.navigate(['/pos']);
  }

  /** Logs out and returns to the PIN screen */
  logout(): void {
    this.authService.logout();
  }

}
