import { Injectable } from '@angular/core';

import { ADMIN_SESSION_DURATION_MS, ADMIN_SESSION_KEY, AdminSession } from '../models';
import { ConfigService } from './config.service';

/**
 * Manages the admin back-office session.
 *
 * Sessions are stored in localStorage as { expiresAt: number }.
 * They last 30 minutes from login and are checked on every guard evaluation.
 * No JWT or backend involvement — this is a local PIN-based access control.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {

  constructor(private readonly configService: ConfigService) {}

  //#region Public API

  /**
   * Verifies the PIN and starts a 30-minute admin session if correct.
   * @param pin The 4-digit PIN entered by the user
   * @returns true if the PIN is correct and the session was created
   */
  async login(pin: string): Promise<boolean> {
    const valid = await this.configService.verifyPin(pin);
    if (!valid) return false;

    const session: AdminSession = {
      expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS,
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    return true;
  }

  /**
   * Ends the current admin session by removing it from localStorage.
   */
  logout(): void {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  /**
   * Returns true if a valid (non-expired) admin session exists.
   */
  isAuthenticated(): boolean {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;

    try {
      const session: AdminSession = JSON.parse(raw);
      if (Date.now() >= session.expiresAt) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
  }

  //#endregion

}
