import { Injectable, OnDestroy, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Order } from '../models';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';

/** Polling interval for pending order sync (milliseconds) */
const SYNC_POLL_INTERVAL_MS = 30_000;

/**
 * Handles background synchronization of offline orders to the backend API.
 *
 * Flow (CLAUDE.md offline-first architecture):
 *   1. Orders are saved to IndexedDB with syncStatus = 'pending'
 *   2. If online, attempt immediate POST /orders/sync
 *   3. If offline, queue stays in Dexie
 *   4. On 'online' event or every 30s (when pending + online) → retry
 *   5. On success: syncStatus = 'synced', syncedAt = now
 *   6. On failure: syncStatus = 'failed' (retried next cycle)
 */
@Injectable({ providedIn: 'root' })
export class SyncService implements OnDestroy {

  //#region Properties
  /** True while a sync cycle is in progress */
  readonly isSyncing = signal(false);

  /** Number of orders pending sync */
  readonly pendingCount = signal(0);

  private readonly onlineHandler = () => this.syncPendingOrders();
  private pollTimerId: ReturnType<typeof setInterval> | null = null;
  //#endregion

  //#region Constructor & Lifecycle
  constructor(
    private readonly db: DatabaseService,
    private readonly api: ApiService,
  ) {
    window.addEventListener('online', this.onlineHandler);
    this.refreshPendingCount();
    this.startPolling();
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    this.stopPolling();
  }
  //#endregion

  //#region Sync Methods

  /**
   * Saves a new order to IndexedDB as pending sync.
   * Always call this instead of writing to the DB directly from a component.
   * @param order The completed order to persist
   */
  async saveOrder(order: Order): Promise<void> {
    await this.db.orders.put({ ...order, syncStatus: 'pending' });
    this.pendingCount.update(n => n + 1);

    if (navigator.onLine) {
      await this.syncPendingOrders();
    }
  }

  /**
   * Fetches all pending orders and attempts to sync them with the API.
   * Runs automatically when the browser goes online or on polling interval.
   */
  async syncPendingOrders(): Promise<void> {
    if (this.isSyncing() || !navigator.onLine) return;

    const pending = await this.db.orders
      .where('syncStatus')
      .equals('pending')
      .toArray();

    if (pending.length === 0) return;

    this.isSyncing.set(true);

    for (const order of pending) {
      await this.syncOrder(order);
    }

    this.isSyncing.set(false);
    await this.refreshPendingCount();
  }
  //#endregion

  //#region Private Helpers

  /**
   * Attempts to POST a single order to the backend API.
   * Updates IndexedDB with the result regardless of outcome.
   * @param order The pending order to sync
   */
  private async syncOrder(order: Order): Promise<void> {
    try {
      await firstValueFrom(
        this.api.post<void>('/orders/sync', order),
      );
      await this.db.orders.update(order.id, {
        syncStatus: 'synced',
        syncedAt: new Date(),
      });
    } catch (error) {
      console.error(`[SyncService] Failed to sync order ${order.id}:`, error);
      await this.db.orders.update(order.id, { syncStatus: 'failed' });
    }
  }

  /**
   * Updates the pendingCount signal from the current IndexedDB state.
   */
  private async refreshPendingCount(): Promise<void> {
    const count = await this.db.orders
      .where('syncStatus')
      .equals('pending')
      .count();
    this.pendingCount.set(count);
  }

  /**
   * Starts a 30-second polling interval.
   * Only syncs when there are pending orders AND the browser is online.
   */
  private startPolling(): void {
    this.pollTimerId = setInterval(async () => {
      if (navigator.onLine && this.pendingCount() > 0) {
        await this.syncPendingOrders();
      }
    }, SYNC_POLL_INTERVAL_MS);
  }

  /** Stops the polling interval */
  private stopPolling(): void {
    if (this.pollTimerId !== null) {
      clearInterval(this.pollTimerId);
      this.pollTimerId = null;
    }
  }
  //#endregion

}
