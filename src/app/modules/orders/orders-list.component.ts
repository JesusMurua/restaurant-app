import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Order } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { OrdersService, getDisplayStatus } from '../../core/services/orders.service';
import { OrderRowComponent } from './order-row.component';

/** Filter tabs for the order list */
type StatusFilter = 'all' | 'new' | 'cooking' | 'ready' | 'delivered';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [FormsModule, OrderRowComponent],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent implements OnInit, OnDestroy {

  //#region Properties
  readonly activeFilter = signal<StatusFilter>('all');
  readonly searchQuery = signal('');
  readonly now = signal(new Date());

  /** Whether the current user can mark orders as delivered */
  readonly canDeliver: boolean;

  readonly filters: { key: StatusFilter; label: string }[] = [
    { key: 'all',       label: 'Todas' },
    { key: 'new',       label: 'Nueva' },
    { key: 'cooking',   label: 'En cocina' },
    { key: 'ready',     label: 'Lista' },
    { key: 'delivered', label: 'Entregada' },
  ];

  /** Filtered and searched orders */
  readonly filteredOrders = computed(() => {
    let orders = this.ordersService.todayOrders();
    const filter = this.activeFilter();
    const query = this.searchQuery().trim();

    if (filter !== 'all') {
      orders = orders.filter(o => this.matchesFilter(o, filter));
    }

    if (query) {
      const num = parseInt(query.replace('#', ''), 10);
      if (!isNaN(num)) {
        orders = orders.filter(o => o.orderNumber === num);
      }
    }

    return orders;
  });

  private clockTimerId: ReturnType<typeof setInterval> | null = null;
  //#endregion

  //#region Constructor
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    const role = this.authService.currentUser()?.role;
    this.canDeliver = role === 'Cashier' || role === 'Owner';
  }
  //#endregion

  //#region Lifecycle
  async ngOnInit(): Promise<void> {
    await this.ordersService.start();
    this.clockTimerId = setInterval(() => this.now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    this.ordersService.stop();
    if (this.clockTimerId !== null) {
      clearInterval(this.clockTimerId);
    }
  }
  //#endregion

  //#region Actions

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  async onMarkDelivered(orderId: string): Promise<void> {
    await this.ordersService.markAsDelivered(orderId);
  }

  goBack(): void {
    this.router.navigate(['/pos']);
  }

  //#endregion

  //#region Helpers

  getStatus(order: Order) {
    return getDisplayStatus(order);
  }

  isDelivered(order: Order): boolean {
    return order.deliveryStatus === 'delivered';
  }

  private matchesFilter(order: Order, filter: StatusFilter): boolean {
    const status = getDisplayStatus(order);
    switch (filter) {
      case 'new':       return status.label === 'Nueva';
      case 'cooking':   return status.label === 'En cocina';
      case 'ready':     return status.label === 'Lista';
      case 'delivered': return status.label === 'Entregada';
      default:          return true;
    }
  }

  //#endregion

}
