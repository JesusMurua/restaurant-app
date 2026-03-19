import { Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Order } from '../models';
import { DatabaseService } from './database.service';

/**
 * Handles background synchronization of offline orders to the backend API.
 *
 * Flow (CLAUDE.md offline-first architecture):
 *   1. Orders are saved to IndexedDB with syncStatus = 'pending'
 *   2. This service listens for the browser 'online' event
 *   3. When online, it sends all pending orders to the API
 *   4. On success: updates syncedAt and syncStatus = 'synced'
 *   5. On failure: updates syncStatus = 'failed' (retried on next online event)
 */
@Injectable({ providedIn: 'root' })
export class SyncService implements OnDestroy {

  //#region Properties
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  /** True while a sync cycle is in progress */
  readonly isSyncing = signal(false);

  /** Number of orders pending sync */
  readonly pendingCount = signal(0);

  private readonly onlineHandler = () => this.syncPendingOrders();
  //#endregion

  //#region Constructor & Lifecycle
  constructor(
    private readonly db: DatabaseService,
    private readonly http: HttpClient,
  ) {
    window.addEventListener('online', this.onlineHandler);
    this.refreshPendingCount();
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
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
   * Runs automatically when the browser goes online.
   */
  async syncPendingOrders(): Promise<void> {
    if (this.isSyncing()) return;

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
        this.http.post<void>(this.apiUrl, order),
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
  //#endregion

}
