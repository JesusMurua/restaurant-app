import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CartService } from '../../core/services/cart.service';

/** Inactivity threshold before showing the "¿Sigues ahí?" overlay (ms) */
const IDLE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

/** Countdown seconds shown in the "¿Sigues ahí?" overlay */
const IDLE_COUNTDOWN_S = 30;

@Component({
  selector: 'app-kiosk-shell',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './kiosk-shell.component.html',
  styleUrl: './kiosk-shell.component.scss',
})
export class KioskShellComponent implements OnInit, OnDestroy {

  //#region Properties

  readonly showIdleOverlay = signal(false);
  readonly idleCountdown = signal(IDLE_COUNTDOWN_S);

  /** Timestamp of the last user interaction */
  private lastActivity = Date.now();
  private idleCheckInterval: ReturnType<typeof setInterval> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  /** Tracks whether a long-press on the logo is in progress */
  private logoPressTimer: ReturnType<typeof setTimeout> | null = null;

  //#endregion

  //#region Constructor
  constructor(
    private readonly router: Router,
    private readonly cartService: CartService,
  ) {}
  //#endregion

  //#region Lifecycle

  ngOnInit(): void {
    // Check every 10 seconds if the user has been idle
    this.idleCheckInterval = setInterval(() => {
      const idle = Date.now() - this.lastActivity;
      if (idle >= IDLE_THRESHOLD_MS && !this.showIdleOverlay()) {
        this.startIdleCountdown();
      }
    }, 10_000);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  //#endregion

  //#region Activity tracking

  /** Any touch or pointer event resets the inactivity timer */
  @HostListener('pointerdown')
  @HostListener('touchstart')
  onUserActivity(): void {
    this.lastActivity = Date.now();
    // Do not dismiss overlay here — user must explicitly tap "Continuar"
  }

  //#endregion

  //#region Idle overlay

  private startIdleCountdown(): void {
    this.idleCountdown.set(IDLE_COUNTDOWN_S);
    this.showIdleOverlay.set(true);

    this.countdownInterval = setInterval(() => {
      const next = this.idleCountdown() - 1;
      if (next <= 0) {
        this.resetToWelcome();
      } else {
        this.idleCountdown.set(next);
      }
    }, 1_000);
  }

  /** User tapped "Continuar" — dismiss overlay and reset timer */
  continueSession(): void {
    this.lastActivity = Date.now();
    this.showIdleOverlay.set(false);
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /** Resets cart and navigates to the welcome screen */
  resetToWelcome(): void {
    this.clearTimers();
    this.showIdleOverlay.set(false);
    void this.cartService.clearCart();
    this.router.navigate(['/kiosk/welcome']);
    // Restart idle monitor
    this.ngOnInit();
  }

  //#endregion

  //#region Logo long-press → admin PIN

  onLogoPressStart(): void {
    this.logoPressTimer = setTimeout(() => {
      this.router.navigate(['/pin'], { queryParams: { returnTo: '/kiosk/catalog' } });
    }, 3_000);
  }

  onLogoPressEnd(): void {
    if (this.logoPressTimer) {
      clearTimeout(this.logoPressTimer);
      this.logoPressTimer = null;
    }
  }

  //#endregion

  //#region Helpers

  private clearTimers(): void {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.logoPressTimer) {
      clearTimeout(this.logoPressTimer);
      this.logoPressTimer = null;
    }
  }

  //#endregion

}
