/**
 * # @pipisasa/storage - Abstraction for Storage implementations
 * 
 * Such as `LocalStorage`, `SessionStorage`, `Cookie` ext.
 * 
 * Example
 * 
 * ```ts
 * // utils/storage.ts
 * 
 * import { Storage } from "@pipisasa/storage";
 * import { SerializableLocalStorage } from "@pipisasa/storage/localStorage";
 * 
 * // Later if you want to move on form localStorage to another type of storage you can just replace this variable
 * export const storage: Storage = new SerializableLocalStorage("some-prefix:");
 * ```
 */
export * from './abstraction.ts';
