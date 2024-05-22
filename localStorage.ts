import type { Event, EventHandler, EventType, Storage, Subscription } from './abstraction.ts';

export class SerializableLocalStorage implements Storage {
  constructor(
    private readonly prefix: string,
  ) {}
  private readonly _subscribers = new Set<EventHandler>();

  private _notify<T extends EventType>(event: Event<T>) {
    this._subscribers.forEach(cb => {
      cb(event);
    })
  }

  prefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T = string>(key: string): T | null {
    const prefixedKey = this.prefixedKey(key);
    if (typeof window === 'undefined') return null;
    const strVal = localStorage.getItem(prefixedKey);
    if (strVal === null) return null;
    const parsedVal = JSONParseAsync<T>(strVal);
    return parsedVal;
  }
  set<T = string>(key: string, value: T): void {
    const prefixedKey = this.prefixedKey(key);
    if (typeof window === 'undefined') return;
    const strVal = JSON.stringify(value)
    localStorage.setItem(prefixedKey, strVal);

    this._notify({ type: 'set', key, value });
  }
  delete(key: string): void {
    const prefixedKey = this.prefixedKey(key);
    if (typeof window === 'undefined') return;
    localStorage.removeItem(prefixedKey);

    this._notify({ type: 'delete', key });
  }
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();

    this._notify({ type: 'clear' });
  }

  addEventListener(callback: EventHandler): Subscription {
    this._subscribers.add(callback);
    const unsubscribe = () => {
      this._subscribers.delete(callback);
    }
    return { unsubscribe }
  }
}

export const JSONParseAsync = <T>(str: string): T | null => {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return null;
  }
}