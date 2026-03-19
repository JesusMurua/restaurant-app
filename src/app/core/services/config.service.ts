import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  AppConfig,
  DEFAULT_APP_CONFIG,
  DEFAULT_DEVICE_CONFIG,
  DEVICE_CONFIG_KEY,
  DeviceConfig,
} from '../models';
import { DatabaseService } from './database.service';

/**
 * Manages two separate layers of configuration:
 *
 * Business config (IndexedDB via Dexie):
 *   Shared across all devices — businessName, locationName, PIN.
 *   Exposed via config$.
 *
 * Device config (localStorage):
 *   Local to this device only — mode, deviceName.
 *   Exposed via deviceConfig$.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {

  /** Reactive business config stream — emits on every load() and save() */
  readonly config$ = new BehaviorSubject<AppConfig>({ ...DEFAULT_APP_CONFIG });

  /** Reactive device config stream — emits on every loadDeviceConfig() and saveDeviceConfig() */
  readonly deviceConfig$ = new BehaviorSubject<DeviceConfig>({ ...DEFAULT_DEVICE_CONFIG });

  constructor(private readonly db: DatabaseService) {
    // Eagerly load device config so subscribers get the real value immediately
    this.loadDeviceConfig();
  }

  //#region Business config (Dexie)

  /**
   * Loads the business config from IndexedDB and emits to config$.
   * Seeds DEFAULT_APP_CONFIG on first launch.
   */
  async load(): Promise<AppConfig> {
    const stored = await this.db.config.get('main');
    const config = stored ?? { ...DEFAULT_APP_CONFIG };

    if (!stored) {
      await this.db.config.put(DEFAULT_APP_CONFIG);
    }

    this.config$.next(config);
    return config;
  }

  /**
   * Persists the business config to IndexedDB and emits to config$.
   * @param config Updated config to save
   */
  async save(config: AppConfig): Promise<void> {
    const normalized = { ...config, id: 'main' as const };
    await this.db.config.put(normalized);
    this.config$.next(normalized);
  }

  /**
   * Verifies whether the provided PIN matches the stored one.
   * @param pin 4-digit PIN string to verify
   */
  async verifyPin(pin: string): Promise<boolean> {
    const config = await this.load();
    return config.pin === pin;
  }

  /**
   * Updates the PIN in the stored config.
   * @param newPin New 4-digit PIN string
   */
  async updatePin(newPin: string): Promise<void> {
    const config = await this.load();
    await this.save({ ...config, pin: newPin });
  }

  //#endregion

  //#region Device config (localStorage)

  /**
   * Reads the device config from localStorage and emits to deviceConfig$.
   * Falls back to DEFAULT_DEVICE_CONFIG if no value has been saved yet.
   */
  loadDeviceConfig(): DeviceConfig {
    try {
      const raw = localStorage.getItem(DEVICE_CONFIG_KEY);
      const config: DeviceConfig = raw ? JSON.parse(raw) : { ...DEFAULT_DEVICE_CONFIG };
      this.deviceConfig$.next(config);
      return config;
    } catch {
      this.deviceConfig$.next({ ...DEFAULT_DEVICE_CONFIG });
      return { ...DEFAULT_DEVICE_CONFIG };
    }
  }

  /**
   * Persists the device config to localStorage and emits to deviceConfig$.
   * Only affects this physical device — other devices are unchanged.
   * @param config Updated device config to save
   */
  saveDeviceConfig(config: DeviceConfig): void {
    localStorage.setItem(DEVICE_CONFIG_KEY, JSON.stringify(config));
    this.deviceConfig$.next(config);
  }

  //#endregion

}
