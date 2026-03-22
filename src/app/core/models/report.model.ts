/** Full report summary for a date range */
export interface ReportSummary {
  from: Date;
  to: Date;
  totalOrders: number;
  cancelledOrders: number;
  completedOrders: number;
  totalCents: number;
  cashCents: number;
  cardCents: number;
  discountCents: number;
  averageTicketCents: number;
  dailySummaries: DailySummary[];
  topProducts: TopProduct[];
  orders: OrderReportRow[];
}

/** Aggregated metrics for a single day */
export interface DailySummary {
  date: Date;
  orderCount: number;
  totalCents: number;
  cancelledCount: number;
}

/** Product ranking entry within a report */
export interface TopProduct {
  name: string;
  quantity: number;
  totalCents: number;
}

/** Flat order row for the report table */
export interface OrderReportRow {
  orderNumber: number;
  createdAt: Date;
  totalCents: number;
  discountCents?: number;
  paymentMethod: string;
  status: string;
  cancellationReason?: string;
  itemCount: number;
}

/** Predefined report period options */
export type ReportPeriod = 'today' | 'week' | 'month' | 'custom';
