/**
  * @module
  * This module contains LocalStorage implementation of StorageProvider interface
  * 
  * @example
  * ```ts
  * import { Storage } from "@pipisasa/storage";
  * import { LocalStorageProvider } from "@pipisasa/storage/providers/localStorage";
  * 
  * const storage = new Storage({
  *   provider: new LocalStorageProvider(),
  * });
  * 
  * ```
  */


import { StorageOptions, StorageProvider } from '../types.ts';

/**
 * LocalStorage implementation of StorageProvider interface
 * @example
 * ```ts
 * import { Storage } from "@pipisasa/storage";
 * import { LocalStorageProvider } from "@pipisasa/storage/providers/localStorage";
 * 
 * const storage = new Storage({
 *   provider: new LocalStorageProvider(),
 * });
 * 
 * ```
 *  
 * */

export class LocalStorageProvider implements StorageProvider {
  get<T = string>(key: string, options: StorageOptions): T | null {
    const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
    if (typeof window === 'undefined') return null;

    const strVal = localStorage.getItem(prefixedKey);
    if (strVal === null) return null;

    return options.jsonSerializer.parse<T>(strVal);
  }

  set<T = string>(key: string, value: T, options: StorageOptions): T | null {
    const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
    if (typeof window === 'undefined') return null;

    const strVal = options.jsonSerializer.stringify(value);
    localStorage.setItem(prefixedKey, strVal);

    return value;
  }

  delete<T = string>(key: string, options: StorageOptions): T | null {
    const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
    if (typeof window === 'undefined') return null;

    const oldValue = this.get<T>(key, options);
    localStorage.removeItem(prefixedKey);

    return oldValue;
  }

  clear(options: StorageOptions): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}
