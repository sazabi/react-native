/**
 * Monotonic milliseconds for durations and ordering. `performance.now()` where
 * the host has it (every browser, React Native on Hermes); `Date.now()` as the
 * fallback so the core never assumes a global.
 */
export declare const monotonicNow: () => number;
