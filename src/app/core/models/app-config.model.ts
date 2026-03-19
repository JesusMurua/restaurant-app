import { BusinessConfig, DEFAULT_BUSINESS_CONFIG } from './business-config.model';

/**
 * Full application configuration stored in IndexedDB (Dexie 'config' table).
 * Extends BusinessConfig with security settings managed in the back office.
 *
 * A single record with id='main' is stored for the whole business.
 * Operating mode is NOT stored here — it lives in DeviceConfig (localStorage)
 * so each device can independently run in counter, cashier, or kiosk mode.
 */
export interface AppConfig extends BusinessConfig {
  /** Primary key for Dexie — always 'main' (single-record table) */
  id: 'main';
  /** 4-digit PIN for back-office access. Stored as plain string (local-only, no backend yet). */
  pin: string;
}

/** Default config seeded on first launch */
export const DEFAULT_APP_CONFIG: AppConfig = {
  ...DEFAULT_BUSINESS_CONFIG,
  id:  'main',
  pin: '1234',
};
