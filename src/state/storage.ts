const STORAGE_KEY = 'fbm-dashboard-processed';

export interface StateStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function createInMemoryStorage(): StateStorage {
  const store = new Map<string, string>();
  return {
    getItem(key: string): string | null {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
    removeItem(key: string): void {
      store.delete(key);
    }
  };
}

export function createStateStorage(): StateStorage {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return localStorage;
    } catch {
      return createInMemoryStorage();
    }
  }
  return createInMemoryStorage();
}

export function loadProcessedIds(storage: StateStorage): string[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function saveProcessedIds(storage: StateStorage, ids: string[]): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* silent fallback */
  }
}

export function clearProcessedIds(storage: StateStorage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* silent fallback */
  }
}
