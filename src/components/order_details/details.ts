import type { Order } from '../../types/order.js';
import { classifyGroup, computeReviewFlags, getGroupLabel } from '../../domain/orders/index.js';

export function renderOrderRow(order: Order, isProcessed: boolean): string {
  const group = classifyGroup(order);
  const flags = computeReviewFlags(order);
  const hasFlags = flags.reasons.length > 0;
  const detailId = `detail-${order.orderId}`;
  const rowClass = isProcessed ? 'order-row processed' : 'order-row';

  return `
    <div class="${rowClass}" data-order-id="${order.orderId}">
      <button
        class="order-header"
        aria-expanded="false"
        aria-controls="${detailId}"
        type="button"
      >
        <span class="order-id">${order.amazonOrderId}</span>
        <span class="order-customer">${order.customerName}</span>
        ${isProcessed ? '<span class="status-badge processed">Processed</span>' : ''}
        <span class="order-group-badge">${getGroupLabel(group)}</span>
        ${hasFlags ? flags.reasons.map(r => `<span class="review-badge ${r}">${r}</span>`).join('') : ''}
        <span class="expand-icon" aria-hidden="true">▶</span>
      </button>
      <div id="${detailId}" class="order-details" role="region" hidden>
        <dl class="order-meta">
          <dt>Order Date</dt>
          <dd>${new Date(order.orderDate).toLocaleString('de-DE')}</dd>
          <dt>Shipping Address</dt>
          <dd>${order.shippingAddress}</dd>
          <dt>Fulfillment</dt>
          <dd>${order.fulfillmentChannel}</dd>
        </dl>
        <table class="items-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td><code>${item.sku}</code></td>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>€${item.price.toFixed(2)}</td>
                <td>€${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${isProcessed
          ? '<p class="already-processed-msg">Already processed.</p>'
          : '<button class="mark-processed-btn" type="button" data-action="mark-processed">Mark as Processed</button>'}
      </div>
    </div>
  `;
}

export function initExpandableRows(container: HTMLElement): void {
  container.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest('.order-header') as HTMLButtonElement | null;
    if (!button) return;

    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const detailId = button.getAttribute('aria-controls');
    const detail = detailId ? document.getElementById(detailId) : null;

    if (detail) {
      const next = !isExpanded;
      button.setAttribute('aria-expanded', String(next));
      detail.hidden = !next;
      const icon = button.querySelector('.expand-icon');
      if (icon) {
        (icon as HTMLElement).style.transform = next ? 'rotate(90deg)' : 'rotate(0deg)';
      }
    }
  });
}
