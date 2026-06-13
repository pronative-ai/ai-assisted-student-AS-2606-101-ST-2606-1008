import type { ActivityEvent, ActivityEventType } from '../types/activity.js';

const MAX_EVENTS = 100;

export class ActivityLog {
  private events: ActivityEvent[] = [];
  private listeners: Array<() => void> = [];

  addEvent(type: ActivityEventType, message: string, orderId?: string): void {
    this.events.push({
      type,
      timestamp: new Date().toISOString(),
      orderId,
      message
    });
    if (this.events.length > MAX_EVENTS) {
      this.events.shift();
    }
    this.notify();
  }

  getEvents(): ActivityEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
    this.notify();
  }

  onChange(callback: () => void): void {
    this.listeners.push(callback);
  }

  private notify(): void {
    for (const cb of this.listeners) {
      cb();
    }
  }
}
