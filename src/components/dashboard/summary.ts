import type { GroupCategory, OrderSummary } from '../../types/group.js';
import { getGroupLabel } from '../../domain/orders/index.js';

export function renderSummary(summary: OrderSummary): string {
  return `
    <section class="summary-cards" aria-label="Order summary">
      <div class="summary-card total">
        <span class="summary-value">${summary.totalOrders}</span>
        <span class="summary-label">Total Orders</span>
      </div>
      ${(Object.entries(summary.byGroup) as [GroupCategory, number][]).map(([key, count]) => `
        <div class="summary-card group">
          <span class="summary-value">${count}</span>
          <span class="summary-label">${getGroupLabel(key)}</span>
        </div>
      `).join('')}
      <div class="summary-card review ${summary.needingReview > 0 ? 'has-review' : ''}">
        <span class="summary-value">${summary.needingReview}</span>
        <span class="summary-label">Needs Review</span>
      </div>
      <div class="summary-card processed">
        <span class="summary-value">${summary.processed}</span>
        <span class="summary-label">Processed</span>
      </div>
    </section>
  `;
}
