import type { ClientEvent, ConsoleCaptureLevel } from "./types.js";
export interface ConsoleCaptureOptions {
    emit(event: ClientEvent): void;
    levels: ConsoleCaptureLevel[];
    /** Lines the SDK itself prints start with this and are never re-captured. */
    selfPrefix: string;
}
export interface ConsoleCaptureHandle {
    teardown(): void;
}
/**
 * Print through the console without mirroring the line into the event
 * stream: for a host-facing message the SDK prints on another component's
 * behalf (the dev-mode rejection warning it relays for React Native).
 */
export declare const withoutConsoleCapture: (print: () => void) => void;
/**
 * Mirror selected console levels into the event stream as `log` events.
 * The original console method always runs first (devtools behavior is never
 * altered) and capture failures are swallowed. Lines the SDK itself prints
 * (prefixed with `selfPrefix`) are skipped to avoid self-capture.
 */
export declare const installConsoleCapture: (options: ConsoleCaptureOptions) => ConsoleCaptureHandle;
