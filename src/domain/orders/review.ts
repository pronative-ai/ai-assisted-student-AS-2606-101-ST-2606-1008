import type { ReviewFlag, ReviewReason } from '../../types/group.js';
import type { Order } from '../../types/order.js';
import { getDistinctSkus, hasRepeatedSku, isHighQuantity } from './grouping.js';

export function computeReviewFlags(order: Order): ReviewFlag {
  const reasons: ReviewReason[] = [];

  if (getDistinctSkus(order).length > 1) {
    reasons.push('mixed-sku');
  }

  if (isHighQuantity(order)) {
    reasons.push('high-quantity');
  }

  if (hasRepeatedSku(order)) {
    reasons.push('repeated-sku');
  }

  return { orderId: order.orderId, reasons };
}

export function isNeedingReview(order: Order): boolean {
  return computeReviewFlags(order).reasons.length > 0;
}
