import type { Order } from '../../types/order.js';
import type { GroupCategory } from '../../types/group.js';
import { classifyGroup, getGroupLabel } from '../../domain/orders/index.js';
import { renderOrderRow } from '../order_details/details.js';
import type { OrderStateStore } from '../../state/orderState.js';

const GROUP_ORDER: GroupCategory[] = [
  'single-sku-qty-1',
  'single-sku-qty-2',
  'single-sku-qty-3-plus',
  'mixed-multi-line'
];

export function renderGroupedSections(orders: Order[], state: OrderStateStore): string {
  const grouped: Record<GroupCategory, Order[]> = {
    'single-sku-qty-1': [],
    'single-sku-qty-2': [],
    'single-sku-qty-3-plus': [],
    'mixed-multi-line': []
  };

  for (const order of orders) {
    const group = classifyGroup(order);
    grouped[group].push(order);
  }

  return GROUP_ORDER.map(category => {
    const ordersInGroup = grouped[category];
    if (ordersInGroup.length === 0) return '';
    return `
      <section class="group-section" aria-labelledby="group-${category}">
        <h2 id="group-${category}" class="group-heading">
          ${getGroupLabel(category)}
          <span class="group-count">${ordersInGroup.length}</span>
        </h2>
        <div class="orders-list">
          ${ordersInGroup.map(o => renderOrderRow(o, state.isProcessed(o.orderId))).join('')}
        </div>
      </section>
    `;
  }).join('');
}
