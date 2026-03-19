/**
 * Admin session stored in localStorage.
 * A session is valid while Date.now() < expiresAt.
 * Sessions last 30 minutes from the moment of login.
 */
export interface AdminSession {
  expiresAt: number; // Unix timestamp in milliseconds
}

export const ADMIN_SESSION_KEY = 'adminSession';
export const ADMIN_SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
