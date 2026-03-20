import { Injectable, OnDestroy, signal } from '@angular/core';

import { Order } from '../models';
import { DatabaseService } from './database.service';

/** Polling interval for order list refresh (milliseconds) */
const ORDERS_POLL_INTERVAL_MS = 10_000;

/** Display status computed from order fields */
export interface OrderDisplayStatus {
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Pure function — computes the visual display status of an order.
 *
 * Priority (highest first):
 *   delivered → Lista entregada (blue)
 *   kitchenStatus 'done' → Lista (green)
 *   kitchenStatus 'new'  → En cocina (orange)
 *   kitchenStatus undefined → Nueva (grey)
 */
export function getDisplayStatus(order: Order): OrderDisplayStatus {
  if (order.deliveryStatus === 'delivered') {
    return { label: 'Entregada', color: '#2563EB', bgColor: 'rgba(37, 99, 235, 0.1)' };
  }
  if (order.kitchenStatus === 'done') {
    return { label: 'Lista', color: '#16A34A', bgColor: 'rgba(22, 163, 74, 0.1)' };
  }
  if (order.kitchenStatus === 'new') {
    return { label: 'En cocina', color: '#EA580C', bgColor: 'rgba(234, 88, 12, 0.1)' };
  }
  return { label: 'Nueva', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
}

/**
 * Manages the full order list for the cashier orders view (/orders).
 *
 * - Loads all of today's orders from Dexie
 * - Polls every 10 seconds for updates
 * - Provides markAsDelivered() for cashiers
 */
@Injectable({ providedIn: 'root' })
export class OrdersService implements OnDestroy {

  //#region Properties
  /** All of today's orders, sorted oldest first */
  readonly todayOrders = signal<Order[]>([]);

  private pollTimerId: ReturnType<typeof setInterval> | null = null;
  //#endregion

  //#region Constructor & Lifecycle
  constructor(private readonly db: DatabaseService) {}

  ngOnDestroy(): void {
    this.stopPolling();
  }
  //#endregion

  //#region Public Methods

  /** Starts loading orders and polling. Call from the orders list component. */
  async start(): Promise<void> {
    await this.loadTodayOrders();
    this.startPolling();
  }

  /** Stops polling. Call when leaving the orders list. */
  stop(): void {
    this.stopPolling();
  }

  /**
   * Marks an order as delivered in Dexie and updates the local list.
   * @param orderId The order UUID to mark as delivered
   */
  async markAsDelivered(orderId: string): Promise<void> {
    await this.db.orders.update(orderId, { deliveryStatus: 'delivered' });
    this.todayOrders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, deliveryStatus: 'delivered' as const } : o),
    );
  }

  //#endregion

  //#region Private Helpers

  /** Loads all orders created today, sorted oldest first. */
  private async loadTodayOrders(): Promise<void> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const orders = await this.db.orders
      .where('createdAt')
      .aboveOrEqual(todayStart)
      .toArray();

    orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    this.todayOrders.set(orders);
  }

  private startPolling(): void {
    this.pollTimerId = setInterval(() => this.loadTodayOrders(), ORDERS_POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollTimerId !== null) {
      clearInterval(this.pollTimerId);
      this.pollTimerId = null;
    }
  }

  //#endregion

}
