export type GroupCategory =
  | 'single-sku-qty-1'
  | 'single-sku-qty-2'
  | 'single-sku-qty-3-plus'
  | 'mixed-multi-line';

export interface GroupBucket {
  category: GroupCategory;
  label: string;
  orders: string[];
}

export type ReviewReason = 'mixed-sku' | 'high-quantity' | 'repeated-sku';

export interface ReviewFlag {
  orderId: string;
  reasons: ReviewReason[];
}

export interface OrderSummary {
  totalOrders: number;
  byGroup: Record<GroupCategory, number>;
  needingReview: number;
  processed: number;
}
