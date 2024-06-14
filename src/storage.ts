import { StorageOptions, StorageEvent, EventHandler, StorageEventType, StorageAction } from "./types";
import { defaultJSONSerializer } from "./serializers/defaultJSONSerializer";
import { LocalStorageProvider } from "./providers/localStorage";

/**
 * Typesafe Storage with event listeners.
 * 
 * @param options Options for storage. Optional
 * @param options.jsonSerializer serialize and deserialize data to JSON string. Optional. Default is `defaultJSONSerializer`
 * @param options.provider Storage provider. Optional. Default is `LocalStorageProvider`
 * @param options.prefix Prefix for all keys. Optional
 * 
 * @example
 * 
 * ```ts
 * // utils/storage.ts
 * import { Storage } from '@pipisasa/storage';
 * // import { LocalStorageProvider } from '@pipisasa/storage/providers/localStorage';
 * // import { defaultJSONSerializer } from '@pipisasa/storage/serializers/defaultJSONSerializer';
 * 
 * type Product = {
 *   id: number;
 *   name: string;
 * }
 * 
 * type MyStorage = {
 *   accessToken: string;
 *   refreshToken: string;
 *   products: Product[];
 * }
 * 
 * const storage = new Storage<MyStorage>({
 *   //? - prefix on keys [Optional]
 *   prefix: "some-prefix:",
 *   //? - Storage provider. You can make your own with StorageProvider interface
 *   provider: new LocalStorageProvider(),
 *   //? - jsonSerializer for serialize and deserialize JSON string
 *   jsonSerializer: defaultJSONSerializer,
 * });
 * 
 * const a = storage.get("products"); // a: Product[]
 * 
 * storage.set("products", [{ id: 123, name: "adsfasdf" }]);
 * 
 * storage.addEventListener('products:set', (e) => {
 *   console.log(e.type, e.key, e.value);
 * });
 * 
 * storage.addEventListener('products:*', (e) => {
 *   console.log(e.type, e.key, e.value);
 * });
 * 
 * storage.addEventListener('*:set', (e) => {
 *   console.log(e.type, e.key, e.value);
 * });
 * 
 * storage.addEventListener('*:*', (e) => {
 *   console.log(e.type, e.key, e.value);
 * });
 * ```
 */
export class Storage<
  StorageValues extends Record<string, unknown> = Record<string, unknown>,
  TKey extends keyof StorageValues & string = keyof StorageValues & string,
> {
  options: StorageOptions;
  constructor(options?: StorageOptions) {
    this.options = options ?? {
      jsonSerializer: defaultJSONSerializer,
      provider: new LocalStorageProvider(),
    };
  }

  /**
   * ```ts
   * serialize<T>(value: T): string
   * ```
   * @param value value that will be serialized into JSON string
   * @returns string
   */
  serialize<T>(value: T): string {
    return this.options.jsonSerializer.stringify(value);
  }
  /**
   * ```ts
   * deserialize<T>(str: string): T | null
   * ```
   * @param str JSON string that will be deserialized into value
   * @returns T
   */
  deserialize<T>(str: string): T | null {
    return this.options.jsonSerializer.parse<T>(str);
  }

  /**
   * ```ts
   * get<TKey, TValue>(key: TKey): TValue | null
   * ```
   * @param key Key of the stored value
   * @returns `TValue | null`
   */
  get<TK extends TKey, T extends StorageValues[TK] = StorageValues[TK]>(key: TK): T | null {
    return this.options.provider.get<T>(key, this.options);
  }

  /**
   * ```ts
   * set<TKey, TValue>(key: TKey, value: TValue): TValue | null
   * ```
   * @param key Key of the stored value
   * @param value Value that will be stored
   * @returns `TValue | null`
   */
  set<TK extends TKey, T extends StorageValues[TK] | null = StorageValues[TK] | null>(key: TK, value: T): T | null {
    const newValue = this.options.provider.set<T>(key, value, this.options);

    this._notify({ type: 'set', key, value: newValue });

    return newValue;
  }

  /**
   * ```ts
   * delete<TKey, TValue>(key: TKey): TValue | null
   * ```
   * @param key Key of the stored value that will be deleted
   * @returns `TValue | null`
   */
  delete<TK extends TKey, T extends StorageValues[TK] = StorageValues[TK]>(key: TK): T | null {
    const oldValue = this.options.provider.delete<T>(key, this.options);

    this._notify({ type: 'delete', key, value: oldValue });

    return oldValue;
  }

  /**
   * Removes all values from storage
   * @returns void
   */
  clear(): void {
    this.options.provider.clear(this.options);

    this._notify({ type: 'clear', key: undefined, value: undefined });
  }

  private readonly _subscribersMap = new Map<StorageEventType<StorageValues>, Set<EventHandler<StorageValues>>>();

  private _notify<TK extends TKey, TAction extends StorageAction>(event: StorageEvent<StorageValues, TK, TAction>) {
    if (event.type === 'clear') {
      this._subscribersMap.forEach((subscribersSet, key) => {
        if (key.endsWith(':*') || key.endsWith(':clear')) {
          subscribersSet.forEach(cb => {
            cb(event);
          })
        }
      })
      return;
    }

    this._subscribersMap.get(`${event.key}:${event.type}`)?.forEach(cb => {
      cb(event);
    });
    this._subscribersMap.get(`*:${event.type}`)?.forEach(cb => {
      cb(event);
    });
    this._subscribersMap.get(`${event.key}:*`)?.forEach(cb => {
      cb(event);
    });

  }

  /**
   * 
   * @param event
   * ```ts
   * '*:*' |
   * '*:get' | '*:set' | '*:delete' | '*:clear' |
   * 'someKey:*' |
   * 'someKey:get' | 'someKey:set' | 'someKey:delete' | 'someKey:clear'
   * ```
   * @param callback ```ts
   * (event: Event) => void
   * ```
   * @returns unsubscribe function
   * @example
   * ```ts
   * const unsubscribe = storage.addEventListener('products:set', (e) => {
   *   console.log(e.type, e.key, e.value);
   * });
   * 
   * unsubscribe();
   * 
   * ```
   */
  addEventListener<TK extends TKey, TAction extends StorageAction>(
    eventType: StorageEventType<StorageValues, TK, TAction>,
    callback: EventHandler<StorageValues, TK, TAction>
  ): () => void {
    const subscribersSet: Set<EventHandler<StorageValues, TK, TAction>> = this._subscribersMap.get(eventType) ?? new Set<EventHandler<StorageValues, TK, TAction>>();
    this._subscribersMap.set(eventType, subscribersSet as Set<EventHandler<StorageValues>>);


    subscribersSet.add(callback);

    const unsubscribe = () => {
      subscribersSet.delete(callback);
    }
    return unsubscribe;
  }

  /**
   * Removes event listener
   * @param event
   * @param callback
   * @returns void
   * @example
   * ```ts
   * const handleTokenSet: EventHandler = (e) => {
   *   console.log(e.type, e.key, e.value);
   * };
   *
   * storage.addEventListener('products:set', handleTokenSet);
   * 
   * storage.removeEventListener('products:set', handleTokenSet);
   * 
   * ```
   */
  removeEventListener<TK extends TKey, TAction extends StorageAction>(
    eventType: StorageEventType<StorageValues, TK, TAction>,
    callback: EventHandler<StorageValues, TK, TAction>
  ): void {
    const subscribersSet = this._subscribersMap.get(eventType);
    if (!subscribersSet) return;
    subscribersSet.delete(callback as EventHandler<StorageValues>);
  }
}