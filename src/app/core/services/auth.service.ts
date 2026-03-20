import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AuthUser,
  LoginResponse,
  RETURN_URL_KEY,
} from '../models';
import { ApiService } from './api.service';

/**
 * Manages authentication state for the POS application.
 *
 * Two login methods:
 *   - PIN login (cashiers, kitchen staff) → POST /api/auth/pin-login
 *   - Email login (owners) → POST /api/auth/email-login
 *
 * Token and user are persisted in localStorage so sessions survive refresh.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  //#region Properties

  /** Current authenticated user — null when logged out */
  readonly currentUser = signal<AuthUser | null>(this.loadUserFromStorage());

  /** True when a user is authenticated with a valid token */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  //#endregion

  //#region Constructor
  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
  ) {}
  //#endregion

  //#region Login Methods

  /**
   * Authenticates via 4-digit PIN (cashiers, kitchen staff).
   * @param branchId Branch to authenticate against
   * @param pin 4-digit PIN string
   * @returns The authenticated user on success, or null on failure
   */
  async pinLogin(branchId: number, pin: string): Promise<AuthUser | null> {
    try {
      const response = await firstValueFrom(
        this.api.post<LoginResponse>('/auth/pin-login', { branchId, pin }),
      );
      return this.handleLoginSuccess(response);
    } catch (error) {
      console.error('[AuthService] PIN login failed:', error);
      return null;
    }
  }

  /**
   * Authenticates via email and password (owners).
   * @param email User email
   * @param password User password
   * @returns The authenticated user on success, or null on failure
   */
  async emailLogin(email: string, password: string): Promise<AuthUser | null> {
    try {
      const response = await firstValueFrom(
        this.api.post<LoginResponse>('/auth/email-login', { email, password }),
      );
      return this.handleLoginSuccess(response);
    } catch (error) {
      console.error('[AuthService] Email login failed:', error);
      return null;
    }
  }

  /**
   * Clears auth state and redirects to /pin.
   */
  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/pin']);
  }

  /**
   * Returns the stored token, or null if not authenticated.
   * Used by the auth interceptor to attach Bearer headers.
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Consumes and clears the saved return URL (set by AuthGuard on redirect).
   * @returns The URL the user was trying to reach, or null
   */
  consumeReturnUrl(): string | null {
    const url = localStorage.getItem(RETURN_URL_KEY);
    if (url) localStorage.removeItem(RETURN_URL_KEY);
    return url;
  }

  //#endregion

  //#region Private Helpers

  /**
   * Persists auth state after a successful login response.
   */
  private handleLoginSuccess(response: LoginResponse): AuthUser {
    const user: AuthUser = {
      token: response.token,
      role: response.role,
      name: response.name,
      branchId: response.branchId,
    };

    localStorage.setItem(AUTH_TOKEN_KEY, user.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);

    return user;
  }

  /**
   * Restores user from localStorage on service creation.
   */
  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      const user: AuthUser = JSON.parse(raw);
      if (!user.token || !user.role) return null;
      return user;
    } catch {
      return null;
    }
  }

  //#endregion

}
