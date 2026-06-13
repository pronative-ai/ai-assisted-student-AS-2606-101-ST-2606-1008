export type ActivityEventType =
  | 'app-initialized'
  | 'order-processed'
  | 'duplicate-prevented'
  | 'reset';

export interface ActivityEvent {
  type: ActivityEventType;
  timestamp: string;
  orderId?: string;
  message: string;
}
