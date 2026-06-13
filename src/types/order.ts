export interface OrderItem {
  sku: string;
  productName: string;
  quantity: number;
  price: number;
}

export type FulfillmentChannel = 'FBM' | 'FBA';

export interface Order {
  orderId: string;
  amazonOrderId: string;
  orderDate: string;
  customerName: string;
  shippingAddress: string;
  items: OrderItem[];
  fulfillmentChannel: FulfillmentChannel;
  status: 'UNSHIPPED' | 'PROCESSED';
  lastModified: string;
}
