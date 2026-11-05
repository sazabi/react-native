/**
 * Shared across every Sazabi client SDK so two SDKs bundled into one app
 * recognize each other's wrappers and never double-wrap a primitive.
 */
export declare const WRAPPED_MARKER = "__sazabiBrowserWrapped";
/** Best-effort idempotency marker on wrapper functions. */
export declare const markWrapped: (fn: object) => void;
export declare const isWrapped: (fn: unknown) => boolean;
