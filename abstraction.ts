export type Subscription = {
  unsubscribe(): void;
}

export type EventHandler = <T extends EventType>(event: Event<T>) => void;

export const EventType = {
  set: 'set',
  delete: 'delete',
  clear: 'clear',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export type Event<T extends EventType> =
  T extends 'clear'
  ? { type: T }
  : T extends 'delete'
  ? { type: T, key: string }
  : T extends 'set'
  ? { type: T, key: string, value: unknown }
  : never;

export interface Storage {
  get<T = string>(key: string): T | null;
  set<T = string>(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;

  addEventListener(callback: EventHandler): Subscription;
}