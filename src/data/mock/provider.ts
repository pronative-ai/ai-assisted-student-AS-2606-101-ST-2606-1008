import type { Order } from '../../types/order.js';
import { MOCK_ORDERS } from './orders.js';

export interface OrderProvider {
  getOrders(): Order[];
  getOrderById(orderId: string): Order | undefined;
}

export class MockOrderProvider implements OrderProvider {
  private orders: Order[];

  constructor() {
    this.orders = [...MOCK_ORDERS];
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders.find(o => o.orderId === orderId);
  }
}

export function createOrderProvider(): OrderProvider {
  return new MockOrderProvider();
}
