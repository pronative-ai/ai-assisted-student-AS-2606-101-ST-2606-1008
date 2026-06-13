import { createStateStorage, type StateStorage, loadProcessedIds, saveProcessedIds, clearProcessedIds } from './storage.js';

export class OrderStateStore {
  private processed: Set<string>;
  private storage: StateStorage;

  constructor() {
    this.storage = createStateStorage();
    this.processed = new Set(loadProcessedIds(this.storage));
  }

  isProcessed(orderId: string): boolean {
    return this.processed.has(orderId);
  }

  markProcessed(orderId: string): boolean {
    if (this.processed.has(orderId)) {
      return false;
    }
    this.processed.add(orderId);
    saveProcessedIds(this.storage, [...this.processed]);
    return true;
  }

  getProcessedIds(): string[] {
    return [...this.processed];
  }

  reset(): void {
    this.processed.clear();
    clearProcessedIds(this.storage);
  }

  getProcessedCount(): number {
    return this.processed.size;
  }
}
