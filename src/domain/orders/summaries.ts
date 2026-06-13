import type { Order } from '../../types/order.js';
import type { OrderSummary, GroupCategory } from '../../types/group.js';
import { classifyGroup } from './grouping.js';
import { isNeedingReview } from './review.js';

export function computeSummary(orders: Order[]): OrderSummary {
  const byGroup: Record<GroupCategory, number> = {
    'single-sku-qty-1': 0,
    'single-sku-qty-2': 0,
    'single-sku-qty-3-plus': 0,
    'mixed-multi-line': 0
  };

  let needingReview = 0;
  let processed = 0;

  for (const order of orders) {
    const group = classifyGroup(order);
    byGroup[group]++;

    if (isNeedingReview(order)) {
      needingReview++;
    }

    if (order.status === 'PROCESSED') {
      processed++;
    }
  }

  return {
    totalOrders: orders.length,
    byGroup,
    needingReview,
    processed
  };
}

export function getGroupLabel(category: GroupCategory): string {
  const labels: Record<GroupCategory, string> = {
    'single-sku-qty-1': 'Single SKU — Qty 1',
    'single-sku-qty-2': 'Single SKU — Qty 2',
    'single-sku-qty-3-plus': 'Single SKU — Qty 3+',
    'mixed-multi-line': 'Mixed / Multi-line'
  };
  return labels[category];
}
