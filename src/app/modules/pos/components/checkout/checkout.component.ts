import { Component, OnInit, computed, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { CartItem, Order, PaymentMethod } from '../../../../core/models';
import { CartService } from '../../../../core/services/cart.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { PrintService } from '../../../../core/services/print.service';
import { SyncService } from '../../../../core/services/sync.service';

/** Internal step of the checkout flow */
type CheckoutStep = 'payment' | 'confirmed';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    PricePipe,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {

  //#region Properties

  /** Current checkout step */
  readonly step = signal<CheckoutStep>('payment');

  /** Selected payment method — null until the user picks one */
  readonly selectedMethod = signal<PaymentMethod | null>(null);

  /**
   * Amount tendered by the customer in cents.
   * Bound via InputNumber (displayed in pesos, converted to cents on change).
   */
  readonly tenderedCents = signal<number>(0);

  /** The completed order, available after confirmPayment() succeeds */
  readonly completedOrder = signal<Order | null>(null);

  /** Snapshot of cart items taken at mount — cart is cleared after confirm */
  cartItems: CartItem[] = [];

  /** Whether the printer fallback "Ver ticket" button should be shown */
  readonly showTicketFallback = !this.printService.hasThermalPrinter();

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  /** Change to give back to the customer in cents (cash payments only) */
  readonly changeCents = computed(() => {
    if (this.selectedMethod() !== 'cash') return 0;
    return Math.max(0, this.tenderedCents() - this.totalCents());
  });

  /**
   * True when the operator can confirm the payment:
   *   - Total must be greater than zero (cart must have items)
   *   - A method must be selected
   *   - For cash: tendered amount must cover the total
   *   - For card: no extra validation needed at this stage
   */
  readonly canConfirm = computed(() => {
    if (this.totalCents() === 0) return false;
    const method = this.selectedMethod();
    if (!method) return false;
    if (method === 'cash') return this.tenderedCents() >= this.totalCents();
    return true; // card — terminal integration handled externally
  });

  /** Total from cart service (reactive signal) */
  readonly totalCents = this.cartService.totalCents;

  /** Item count from cart service */
  readonly itemCount = this.cartService.itemCount;

  //#endregion

  //#region Constructor
  constructor(
    private readonly cartService: CartService,
    private readonly db: DatabaseService,
    private readonly syncService: SyncService,
    private readonly printService: PrintService,
    private readonly router: Router,
  ) {}
  //#endregion

  //#region Lifecycle

  ngOnInit(): void {
    // Subscribe to cart updates — also handles the empty-cart redirect.
    // Using the subscription (instead of a synchronous check) ensures we wait
    // for CartService.loadFromDb() to resolve before deciding to redirect.
    this.cartService.cart$.subscribe(items => {
      if (this.step() !== 'payment') return;

      this.cartItems = items;

      // Redirect if cart is definitively empty (after DB load)
      if (items.length === 0) {
        this.router.navigate(['/pos']);
      }
    });
  }

  //#endregion

  //#region Payment Methods

  /** Selects a payment method and resets tendered amount */
  selectMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.tenderedCents.set(0);
  }

  /**
   * Called by the InputNumber when the tendered amount changes.
   * The InputNumber binds in pesos — this converts to cents.
   * @param pesos Value in pesos from the input (may be null when cleared)
   */
  onTenderedChange(pesos: number | null): void {
    this.tenderedCents.set(Math.round((pesos ?? 0) * 100));
  }

  //#endregion

  //#region Checkout Flow

  /**
   * Confirms the payment and completes the order.
   * Order: save to IndexedDB → print ticket → advance to confirmed step → clear cart.
   *
   * IMPORTANT: step is set to 'confirmed' BEFORE clearCart() so the cart$
   * subscription guard (which checks step === 'payment') does not fire a
   * redirect when the cart becomes empty after clearing.
   */
  async confirmPayment(): Promise<void> {
    if (!this.canConfirm()) return;

    const method = this.selectedMethod()!;
    const orderNumber = (await this.db.orders.count()) + 1;

    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      items: this.cartItems,
      totalCents: this.totalCents(),
      paymentMethod: method,
      tenderedCents: method === 'cash' ? this.tenderedCents() : undefined,
      paymentProvider: null,
      createdAt: new Date(),
      syncStatus: 'pending',
      businessId: 1,
    };

    // 1. Save to IndexedDB — always first (offline-first)
    await this.syncService.saveOrder(order);

    // 2. Print or save ticket text as fallback
    await this.printService.printTicket(order);

    // 3. Advance to confirmation screen BEFORE clearing the cart.
    //    This prevents the cart$ subscription from triggering a redirect
    //    when cart becomes empty in the next step.
    this.completedOrder.set(order);
    this.step.set('confirmed');

    // 4. Clear the cart (safe now — step is already 'confirmed')
    await this.cartService.clearCart();
  }

  /** Navigates back to the POS grid without completing the order */
  cancel(): void {
    this.router.navigate(['/pos']);
  }

  /** Starts a new order — cart is already cleared, navigate back to POS */
  startNewOrder(): void {
    this.router.navigate(['/pos']);
  }

  //#endregion

  //#region Ticket

  /** Opens the saved ticket text in a browser print dialog as fallback */
  viewTicket(): void {
    const order = this.completedOrder();
    if (!order?.ticketText) return;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<pre style="font-family:monospace;font-size:14px;padding:16px">${order.ticketText}</pre>`);
    win.document.close();
    win.print();
  }

  //#endregion

}
