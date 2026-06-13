import type { Order } from '../../types/order.js';

export const MOCK_ORDERS: Order[] = [
  {
    orderId: 'ord-001',
    amazonOrderId: '303-1234567-1234567',
    orderDate: '2026-06-12T08:15:00Z',
    customerName: 'Anna Schmidt',
    shippingAddress: 'Musterstr. 12, 10115 Berlin',
    items: [
      { sku: 'BK-DE-001', productName: 'German Grammar Workbook', quantity: 1, price: 19.99 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T08:15:00Z'
  },
  {
    orderId: 'ord-002',
    amazonOrderId: '303-2345678-2345678',
    orderDate: '2026-06-12T09:30:00Z',
    customerName: 'Max Weber',
    shippingAddress: 'Hauptstr. 45, 50667 Köln',
    items: [
      { sku: 'EL-DE-002', productName: 'USB-C Hub 7in1', quantity: 1, price: 34.50 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T09:30:00Z'
  },
  {
    orderId: 'ord-003',
    amazonOrderId: '303-3456789-3456789',
    orderDate: '2026-06-12T10:00:00Z',
    customerName: 'Laura Fischer',
    shippingAddress: 'Bahnhofstr. 8, 80335 München',
    items: [
      { sku: 'HM-DE-003', productName: 'Bamboo Cutting Board Set', quantity: 2, price: 24.99 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T10:00:00Z'
  },
  {
    orderId: 'ord-004',
    amazonOrderId: '303-4567890-4567890',
    orderDate: '2026-06-12T10:45:00Z',
    customerName: 'Thomas Braun',
    shippingAddress: 'Rathausplatz 3, 20095 Hamburg',
    items: [
      { sku: 'HM-DE-004', productName: 'Stainless Steel Water Bottle', quantity: 2, price: 18.90 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T10:45:00Z'
  },
  {
    orderId: 'ord-005',
    amazonOrderId: '303-5678901-5678901',
    orderDate: '2026-06-12T11:15:00Z',
    customerName: 'Julia Hoffmann',
    shippingAddress: 'Leipziger Str. 22, 04109 Leipzig',
    items: [
      { sku: 'BK-DE-005', productName: 'Children\'s Storybook Collection', quantity: 4, price: 39.95 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T11:15:00Z'
  },
  {
    orderId: 'ord-006',
    amazonOrderId: '303-6789012-6789012',
    orderDate: '2026-06-12T12:00:00Z',
    customerName: 'Markus Klein',
    shippingAddress: 'Schillerstr. 15, 70173 Stuttgart',
    items: [
      { sku: 'EL-DE-006', productName: 'Wireless Bluetooth Earbuds', quantity: 5, price: 59.99 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T12:00:00Z'
  },
  {
    orderId: 'ord-007',
    amazonOrderId: '303-7890123-7890123',
    orderDate: '2026-06-12T13:30:00Z',
    customerName: 'Sabine Wagner',
    shippingAddress: 'Goetheplatz 7, 60313 Frankfurt',
    items: [
      { sku: 'HM-DE-007', productName: 'LED Desk Lamp', quantity: 1, price: 42.00 },
      { sku: 'EL-DE-008', productName: 'Wireless Charging Pad', quantity: 1, price: 29.99 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T13:30:00Z'
  },
  {
    orderId: 'ord-008',
    amazonOrderId: '303-8901234-8901234',
    orderDate: '2026-06-12T14:00:00Z',
    customerName: 'Peter Zimmermann',
    shippingAddress: 'Am Markt 10, 30159 Hannover',
    items: [
      { sku: 'BK-DE-009', productName: 'Art Supplies Kit', quantity: 1, price: 27.50 },
      { sku: 'HM-DE-010', productName: 'Yoga Mat Premium', quantity: 1, price: 34.95 },
      { sku: 'HM-DE-011', productName: 'Resistance Bands Set', quantity: 1, price: 14.99 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-12T14:00:00Z'
  },
  {
    orderId: 'ord-009',
    amazonOrderId: '303-9012345-9012345',
    orderDate: '2026-06-13T06:00:00Z',
    customerName: 'Nina Richter',
    shippingAddress: 'Bergstr. 28, 69115 Heidelberg',
    items: [
      { sku: 'EL-DE-002', productName: 'USB-C Hub 7in1', quantity: 1, price: 34.50 },
      { sku: 'EL-DE-002', productName: 'USB-C Hub 7in1', quantity: 1, price: 34.50 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-13T06:00:00Z'
  },
  {
    orderId: 'ord-010',
    amazonOrderId: '303-0123456-0123456',
    orderDate: '2026-06-13T07:00:00Z',
    customerName: 'Daniel Schulz',
    shippingAddress: 'Königsallee 50, 40215 Düsseldorf',
    items: [
      { sku: 'HM-DE-012', productName: 'Cast Iron Skillet 28cm', quantity: 3, price: 49.99 },
      { sku: 'HM-DE-012', productName: 'Cast Iron Skillet 28cm', quantity: 2, price: 49.99 }
    ],
    fulfillmentChannel: 'FBM',
    status: 'UNSHIPPED',
    lastModified: '2026-06-13T07:00:00Z'
  }
];
