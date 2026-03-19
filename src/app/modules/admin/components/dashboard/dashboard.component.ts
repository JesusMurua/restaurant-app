import { Component, OnInit, signal } from '@angular/core';

import { Order, PaymentMethod } from '../../../../core/models';
import { DatabaseService } from '../../../../core/services/database.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

interface TopProduct {
  name: string;
  count: number;
}

interface DashboardData {
  totalCents: number;
  orderCount: number;
  averageTicketCents: number;
  topMethod: PaymentMethod | null;
  cashCents: number;
  cardCents: number;
  topProducts: TopProduct[];
  orders: Order[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PricePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  readonly data = signal<DashboardData | null>(null);
  readonly isLoading = signal(true);

  constructor(private readonly db: DatabaseService) {}

  async ngOnInit(): Promise<void> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const orders = await this.db.orders
      .where('createdAt')
      .aboveOrEqual(todayStart)
      .toArray();

    const totalCents = orders.reduce((s, o) => s + o.totalCents, 0);
    const orderCount = orders.length;
    const averageTicketCents = orderCount > 0 ? Math.round(totalCents / orderCount) : 0;

    const cashOrders = orders.filter(o => o.paymentMethod === 'cash');
    const cardOrders = orders.filter(o => o.paymentMethod === 'card');
    const cashCents = cashOrders.reduce((s, o) => s + o.totalCents, 0);
    const cardCents = cardOrders.reduce((s, o) => s + o.totalCents, 0);
    const topMethod: PaymentMethod | null = orderCount === 0
      ? null
      : cashOrders.length >= cardOrders.length ? 'cash' : 'card';

    // Count product appearances across all orders
    const productCounts = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.product.name;
        productCounts.set(key, (productCounts.get(key) ?? 0) + item.quantity);
      }
    }

    const topProducts: TopProduct[] = [...productCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    this.data.set({
      totalCents,
      orderCount,
      averageTicketCents,
      topMethod,
      cashCents,
      cardCents,
      topProducts,
      orders: [...orders].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    });

    this.isLoading.set(false);
  }

  /** Formats a Date to HH:MM */
  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

}
