import type { OrderProvider } from '../data/mock/provider.js';
import type { Order } from '../types/order.js';
import { computeSummary } from '../domain/orders/index.js';
import { renderSummary } from '../components/dashboard/summary.js';
import { renderGroupedSections } from '../components/dashboard/groups.js';
import { initExpandableRows } from '../components/order_details/details.js';
import { OrderStateStore } from '../state/orderState.js';
import { ActivityLog } from '../state/activityLog.js';
import { renderActivityLog } from '../components/activity_log/log.js';

export interface AppShellConfig {
  provider: OrderProvider;
  rootElement: HTMLElement;
}

export class AppShell {
  private provider: OrderProvider;
  private root: HTMLElement;
  private state: OrderStateStore;
  private log: ActivityLog;

  constructor(config: AppShellConfig) {
    this.provider = config.provider;
    this.root = config.rootElement;
    this.state = new OrderStateStore();
    this.log = new ActivityLog();
  }

  init(): void {
    this.render();
    initExpandableRows(this.root);
    this.root.addEventListener('click', (e) => this.handleClick(e));

    this.log.addEvent('app-initialized',
      `Dashboard loaded with orders from ${this.provider.getOrders()[0]?.orderDate?.slice(0, 10) ?? 'mock data'}`);
  }

  private render(): void {
    const orders = this.provider.getOrders();
    const summary = computeSummary(orders);

    this.root.innerHTML = `
      <header class="app-header">
        <div class="app-header-left">
          <h1>FBM Order Dashboard</h1>
          <span class="order-count">${orders.length} unshipped orders</span>
        </div>
        <button class="reset-btn" type="button" data-action="reset">Reset All</button>
      </header>
      <main class="app-main">
        ${renderSummary(summary)}
        ${renderGroupedSections(orders, this.state)}
      </main>
      <aside class="app-sidebar">
        ${renderActivityLog(this.log.getEvents())}
      </aside>
    `;
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const actionBtn = target.closest('[data-action]') as HTMLElement | null;
    if (!actionBtn) return;

    const action = actionBtn.getAttribute('data-action');

    if (action === 'mark-processed') {
      const row = actionBtn.closest('[data-order-id]') as HTMLElement | null;
      if (!row) return;
      const orderId = row.getAttribute('data-order-id');
      if (!orderId) return;

      const result = this.state.markProcessed(orderId);
      if (result) {
        const order = this.provider.getOrderById(orderId);
        const customer = order?.customerName ?? orderId;
        this.log.addEvent('order-processed', `Order marked as processed`, orderId);
      } else {
        this.log.addEvent('duplicate-prevented', `Duplicate processing prevented`, orderId);
      }
      this.render();
      initExpandableRows(this.root);
    }

    if (action === 'reset') {
      this.state.reset();
      this.log.addEvent('reset', 'All processed state cleared');
      this.render();
      initExpandableRows(this.root);
    }
  }
}
