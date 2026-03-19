import { CartItem } from './cart-item.model';

/** Supported payment methods at checkout */
export type PaymentMethod = 'cash' | 'card';

/** Lifecycle state of an order relative to backend sync */
export type OrderSyncStatus = 'pending' | 'synced' | 'failed';

/**
 * Payment terminal providers — prepared for future integration.
 * null means the order was processed without an external terminal.
 */
export type PaymentProvider = 'clip' | 'conekta' | 'stripe' | 'mercadopago';

/**
 * A completed order submitted from the POS.
 * Orders are always saved to IndexedDB first, then synced to the API.
 * syncedAt being null means the order is still pending sync.
 */
export interface Order {
  /** UUID generated client-side via crypto.randomUUID() */
  id: string;
  /** Sequential display number shown to staff and customer (e.g. #47) */
  orderNumber: number;
  items: CartItem[];
  /** Order total in cents */
  totalCents: number;
  paymentMethod: PaymentMethod;
  /** Amount tendered in cents (for cash payments) */
  tenderedCents?: number;
  /**
   * Payment terminal provider used — null for direct cash/card without terminal.
   * Prepared for future integration with Clip, Conekta, Stripe, MercadoPago.
   */
  paymentProvider: PaymentProvider | null;
  /** Reference ID returned by the external payment provider, if any */
  externalReference?: string;
  /** Plain-text ticket stored in IndexedDB when no thermal printer is available */
  ticketText?: string;
  createdAt: Date;
  /** Set when the order is successfully persisted in the backend */
  syncedAt?: Date;
  syncStatus: OrderSyncStatus;
  businessId: number;
}
