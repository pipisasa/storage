/**
 * @module
 * This module contains default JSON serializer implementation
 * 
 * @example
 * ```ts
 * import { defaultJSONSerializer } from "@pipisasa/storage/serializers/defaultJSONSerializer";
 * 
 * defaultJSONSerializer.parse<{ name: string }>('{"name": "John"}');
 * // { name: "John" }
 * 
 * defaultJSONSerializer.stringify({ name: "John" });
 * // '{"name": "John"}'
 * 
 * const storage = new Storage({
 *   jsonSerializer: defaultJSONSerializer,
 * });
 * 
 * ```
 * */


import { JSONSerializer } from "../types";

/**
 * Default JSON serializer implementation
 * @example
 * ```ts
 * import { defaultJSONSerializer } from "@pipisasa/storage/serializers/defaultJSONSerializer";
 * 
 * defaultJSONSerializer.parse<{ name: string }>('{"name": "John"}');
 * // { name: "John" }
 * 
 * defaultJSONSerializer.stringify({ name: "John" });
 * // '{"name": "John"}'
 * 
 * const storage = new Storage({
 *   jsonSerializer: defaultJSONSerializer,
 * });
 * 
 * ```
 * */
export const defaultJSONSerializer: JSONSerializer = {
  parse: <T>(str: string): T | null => {
    try {
      return JSON.parse(str) as T;
    } catch (e) {
      return null;
    }
  },
  stringify: <T>(value: T): string => {
    return JSON.stringify(value);
  }
}