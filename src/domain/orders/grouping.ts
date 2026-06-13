import type { GroupCategory } from '../../types/group.js';
import type { Order } from '../../types/order.js';

export function getDistinctSkus(order: Order): string[] {
  return [...new Set(order.items.map(i => i.sku))];
}

export function getTotalQuantity(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function hasRepeatedSku(order: Order): boolean {
  const skus = order.items.map(i => i.sku);
  return new Set(skus).size < skus.length;
}

export function classifyGroup(order: Order): GroupCategory {
  const distinctSkus = getDistinctSkus(order);

  if (distinctSkus.length > 1) {
    return 'mixed-multi-line';
  }

  const totalQty = getTotalQuantity(order);

  if (totalQty === 1) return 'single-sku-qty-1';
  if (totalQty === 2) return 'single-sku-qty-2';
  return 'single-sku-qty-3-plus';
}

export const HIGH_QUANTITY_THRESHOLD = 5;

export function isHighQuantity(order: Order): boolean {
  return getTotalQuantity(order) >= HIGH_QUANTITY_THRESHOLD;
}
