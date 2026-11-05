import type { EventAttributes } from "./types.js";
export declare const truncateValue: (value: string, max?: number) => string;
/**
 * Flatten nested metadata into dot-keyed scalar attributes. Non-scalar leaves
 * are JSON-stringified; strings are length-capped so a hostile or buggy app
 * cannot inflate rows.
 */
export declare const flattenAttributes: (input: Record<string, unknown>, prefix?: string, depth?: number) => EventAttributes;
