/**
 * Enum for StorageAction
 */
export const StorageAction = {
  set: 'set',
  delete: 'delete',
  clear: 'clear',
} as const;

/**
 * Enum for StorageAction
 */
export type StorageAction = (typeof StorageAction)[keyof typeof StorageAction];

/**
 * @param StorageValues type of storage values
 * @param TKey type of key
 * @returns type of event
 * 
 * @example
 * ```ts
 * const a: StorageEventType<{ someKey: string[] }>;
 * 
 * '*:*' |
 * '*:get' | '*:set' | '*:delete' | '*:clear' |
 * 'someKey:*' |
 * 'someKey:get' | 'someKey:set' | 'someKey:delete' | 'someKey:clear'
 * ```
 */
export type StorageEventType<
  StorageValues extends Record<string, unknown> = Record<string, unknown>,
  TKey extends keyof StorageValues & string = keyof StorageValues & string,
  T extends StorageAction = StorageAction,
> = `${TKey | '*'}:${T | '*'}`;

/**
 * @param StorageValues type of storage values
 * @param TKey type of key
 * @param T type of event
 * @returns void
 * 
 * @example
 * ```ts
 * const a: EventHandler = (e) => {
 *   console.log(e.type, e.key, e.value);
 * };
 * ```
 */
export type EventHandler<
  StorageValues extends Record<string, unknown> = Record<string, unknown>,
  TKey extends keyof StorageValues & string = keyof StorageValues & string,
  T extends StorageAction = StorageAction,
> = (event: StorageEvent<StorageValues, TKey, T>) => void;

/**
 * @param StorageValues type of storage values
 * @param TKey type of key
 * @param T type of event
 */

export type StorageEvent<
  StorageValues extends Record<string, unknown> = Record<string, unknown>,
  TKey extends keyof StorageValues & string = keyof StorageValues & string,
  T extends StorageAction = StorageAction,
> =
  T extends 'clear'
  ? { type: T, key: undefined, value: undefined }
  : T extends 'delete'
  ? { type: T, key: TKey, value: StorageValues[TKey] | null }
  : T extends 'set'
  ? { type: T, key: TKey, value: StorageValues[TKey] | null }
  : never;


/**
 * JSONSerializer interface
 * @example
 * ```ts
 * const serializer: JSONSerializer = {
 *   parse: <T>(str: string): T | null => {
 *     try {
 *       return JSON.parse(str) as T;
 *     } catch (e) {
 *       return null;
 *     }
 *   },
 *   stringify: <T>(value: T): string => {
 *     return JSON.stringify(value);
 *   }
 * }
 * 
 * serializer.parse<{ name: string }>('{"name": "John"}');
 * // { name: "John" }
 * 
 * serializer.stringify({ name: "John" });
 * // '{"name": "John"}'
 * 
 * const storage = new Storage({
 *   jsonSerializer: serializer,
 * });
 * 
 * ```
 * */
export interface JSONSerializer {
  /**
   * Parses JSON string to value
   * @param str JSON string
   * @returns value
   * */
  parse<T>(str: string): T | null;
  /**
   * Converts value to JSON string
   * @param value value that will be converted to JSON string
   * @returns JSON string
   * */
  stringify<T>(value: T): string;
}

/**
 * StorageOptions interface
 * @example
 * ```ts
 * const storage = new Storage({
 *   prefix: "some-prefix:",
 *   provider: new LocalStorageProvider(),
 *   jsonSerializer: defaultJSONSerializer,
 * });
 * 
 * ```
 * */
export type StorageOptions = {
  /**
   * Prefix for all keys
   * @default undefined
   * */
  prefix?: string;
  /**
   * JSONSerializer for serialize and deserialize JSON string
   * @default defaultJSONSerializer
   * */
  jsonSerializer: JSONSerializer;
  /**
   * Storage provider
   * @default LocalStorageProvider
   * */
  provider: StorageProvider;
}

/**
 * StorageProvider interface
 * @example
 * ```ts
 * const provider: StorageProvider = {
 *   get: <T>(key: string, options: StorageOptions): T | null => {
 *     const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
 *     if (typeof window === 'undefined') return null;
 *     const strVal = localStorage.getItem(prefixedKey);
 *     if (strVal === null) return null;
 *     return options.jsonSerializer.parse<T>();
 *   },
 *   set: <T>(key: string, value: T, options: StorageOptions): T | null => {
 *     const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
 *     if (typeof window === 'undefined') return null;
 *     const strVal = options.jsonSerializer.stringify(value);
 *     localStorage.setItem(prefixedKey, strVal);
 *     return value;
 *   },
 *   delete: <T>(key: string, options: StorageOptions): T | null => {
 *     const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
 *     if (typeof window === 'undefined') return null;
 *     const oldValue = this.get<T>(key, options);
 *     localStorage.removeItem(prefixedKey);
 *     return oldValue;
 *   },
 *   clear: options: StorageOptions): void => {
 *     if (typeof window === 'undefined') return;
 *     localStorage.clear();
 *   }
 * }
 *
 * const storage = new Storage({
 *   provider: new LocalStorageProvider(),
 * });
 * 
 * ```
 * */
export interface StorageProvider {
  /**
   * Gets value from storage
   * @param key Key of the stored value
   * @param options Options for storage
   * @returns value
   * */
  get<T = string>(key: string, options: StorageOptions): T | null;
  /**
   * Sets value to storage
   * @param key Key of the stored value
   * @param value Value that will be stored
   * @param options Options for storage
   * @returns value
   * */
  set<T = string>(key: string, value: T, options: StorageOptions): T | null;
  /**
   * Deletes value from storage
   * @param key Key of the stored value that will be deleted
   * @param options Options for storage
   * @returns value
   * */
  delete<T = string>(key: string, options: StorageOptions): T | null;
  /**
   * Cleares all storage
   * @param options Options for storage
   * @returns void
   * */
  clear(options: StorageOptions): void;
}
