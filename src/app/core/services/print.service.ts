import { Injectable } from '@angular/core';

import { Order } from '../models';
import { DatabaseService } from './database.service';

/**
 * Handles ticket printing for completed orders.
 *
 * Current state: stub implementation.
 * - If a thermal printer is detected (WebUSB / BrowserPrint SDK): TODO ESC/POS driver.
 * - If no printer: generates a plain-text ticket and persists it in IndexedDB
 *   so it can be displayed on screen or retrieved later.
 *
 * Future integration points:
 *   - ESC/POS over WebUSB (Chrome/Edge)
 *   - Zebra BrowserPrint SDK
 *   - Star Micronics WebPRNT
 */
@Injectable({ providedIn: 'root' })
export class PrintService {

  constructor(private readonly db: DatabaseService) {}

  //#region Public API

  /**
   * Returns true if a supported thermal printer interface is available.
   * Currently detects WebUSB and Zebra BrowserPrint presence.
   * ESC/POS driver is not yet implemented — always returns false until then.
   */
  hasThermalPrinter(): boolean {
    const hasWebUsb = 'usb' in navigator;
    const hasBrowserPrint = 'BrowserPrint' in window;
    // Driver not implemented yet — reserved for future use
    void hasWebUsb;
    void hasBrowserPrint;
    return false;
  }

  /**
   * Prints the ticket for a completed order.
   *
   * If a thermal printer is available: sends ESC/POS commands (TODO).
   * If not: generates plain-text ticket and saves it to IndexedDB.
   *
   * @param order The completed order to print
   */
  async printTicket(order: Order): Promise<void> {
    if (this.hasThermalPrinter()) {
      // TODO: implement ESC/POS printing via WebUSB
      // await this.printEscPos(order);
      return;
    }

    // Fallback: save ticket as plain text in IndexedDB
    const ticketText = this.generateTicketText(order);
    try {
      await this.db.orders.update(order.id, { ticketText });
    } catch (error) {
      console.error('[PrintService] Failed to save ticket text:', error);
    }
  }

  //#endregion

  //#region Private Helpers

  /**
   * Generates a plain-text representation of the order ticket.
   * Format is designed to be readable on screen and printable on 58mm/80mm paper.
   *
   * @param order The completed order
   * @returns Formatted ticket string
   */
  private generateTicketText(order: Order): string {
    const line = '─'.repeat(32);
    const date = new Date(order.createdAt).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemLines = order.items.map(item => {
      const sizeLabel = item.size ? ` (${item.size.label})` : '';
      const price = (item.totalPriceCents / 100).toFixed(2);
      return `${item.quantity}x ${item.product.name}${sizeLabel}`.padEnd(24) + `$${price}`;
    });

    const total = (order.totalCents / 100).toFixed(2);
    const methodLabel = order.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta';

    let changeSection = '';
    if (order.paymentMethod === 'cash' && order.tenderedCents != null) {
      const tendered = (order.tenderedCents / 100).toFixed(2);
      const change = ((order.tenderedCents - order.totalCents) / 100).toFixed(2);
      changeSection = `\nPago:   $${tendered}\nCambio: $${change}`;
    }

    return [
      'MI NEGOCIO',
      date,
      `Orden #${order.orderNumber}`,
      line,
      ...itemLines,
      line,
      `TOTAL: $${total}`,
      `Pago: ${methodLabel}`,
      changeSection,
      line,
      '¡Gracias por su visita!',
    ].join('\n');
  }

  //#endregion

}
