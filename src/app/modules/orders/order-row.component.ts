import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CartItem, Order } from '../../core/models';
import { OrderDisplayStatus } from '../../core/services/orders.service';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-order-row',
  standalone: true,
  imports: [DatePipe, PricePipe],
  templateUrl: './order-row.component.html',
  styleUrl: './order-row.component.scss',
})
export class OrderRowComponent {

  //#region Inputs
  @Input({ required: true }) order!: Order;
  @Input({ required: true }) now!: Date;
  @Input({ required: true }) status!: OrderDisplayStatus;
  @Input() canDeliver = false;
  @Input() isDelivered = false;
  //#endregion

  //#region Outputs
  @Output() markDelivered = new EventEmitter<string>();
  //#endregion

  //#region State
  readonly expanded = signal(false);
  //#endregion

  //#region Computed

  /** Formatted elapsed time as "M:SS" */
  get elapsedFormatted(): string {
    const sec = Math.max(0, Math.floor((this.now.getTime() - new Date(this.order.createdAt).getTime()) / 1000));
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, '0')}`;
  }

  get isOverdue(): boolean {
    return Math.floor((this.now.getTime() - new Date(this.order.createdAt).getTime()) / 1000) >= 600;
  }

  //#endregion

  //#region Actions

  toggle(): void {
    this.expanded.update(v => !v);
  }

  onDeliver(): void {
    this.markDelivered.emit(this.order.id);
  }

  /** Generates a kitchen comanda (no prices) and triggers window.print() */
  onPrint(): void {
    const time = new Date(this.order.createdAt);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

    let html = `
      <div class="print-comanda">
        <div class="print-comanda__separator">────────────────────</div>
        <div class="print-comanda__title">COMANDA</div>
        <div class="print-comanda__order">Orden #${this.order.orderNumber}</div>
        <div class="print-comanda__time">${timeStr} hrs</div>
        <div class="print-comanda__separator">────────────────────</div>`;

    for (const item of this.order.items) {
      html += `<div class="print-comanda__item">${item.quantity}x  ${item.product.name}</div>`;
      if (item.size) {
        html += `<div class="print-comanda__meta">    Tamaño: ${item.size.label}</div>`;
      }
      for (const extra of item.extras) {
        html += `<div class="print-comanda__meta">    + ${extra.label}</div>`;
      }
      if (item.notes) {
        html += `<div class="print-comanda__notes">    ⚠ ${item.notes}</div>`;
      }
    }

    html += `<div class="print-comanda__separator">────────────────────</div></div>`;

    const printEl = document.createElement('div');
    printEl.id = 'print-comanda-area';
    printEl.innerHTML = html;
    document.body.appendChild(printEl);

    window.print();

    document.body.removeChild(printEl);
  }

  //#endregion

  //#region Helpers

  getExtraLabels(item: CartItem): string {
    return item.extras.map(e => e.label).join(', ');
  }

  //#endregion

}
