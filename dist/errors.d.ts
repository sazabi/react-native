import { type ClientEvent } from "./client-sdk-core/index.js";
import type { RejectionTracker } from "./types.js";
export interface ErrorCaptureOptions {
    emit(event: ClientEvent): void;
    /**
     * Receives the fatal error's row instead of `emit`, before the previous
     * handler runs: the crash path must stamp that row with the transport held
     * so it cannot be flushed out of the queue before the outbox drains it.
     */
    onFatal(event: ClientEvent): void;
    unhandledRejections: boolean;
    /** The tracker the host says held the slot before `init()`; runs after ours. */
    previousRejectionTracker?: RejectionTracker;
}
export interface ErrorCaptureHandle {
    teardown(): void;
}
/**
 * Where `<SazabiRoot>` reports a render or commit error it caught. React 19's
 * renderer hands an error no boundary caught straight to React Native's
 * `ExceptionsManager` (the renderer's `onUncaughtError`), never through
 * `ErrorUtils`, and the release app dies there. The root's boundary records
 * the error through the process-wide sink first (so a root from a second
 * copy of the module reaches the running instance), then rethrows it so
 * React Native's fatal path still runs unchanged.
 */
export declare const captureRenderError: (error: unknown) => void;
/**
 * Uncaught errors route through React Native's global handler; a fatal one
 * terminates the app once the handler returns, which is why the crash outbox
 * runs inside it. The previous handler (React Native's red box in
 * development, a crash reporter's hook) always runs after ours. Render
 * errors reach the same fatal path from `<SazabiRoot>` (`captureRenderError`);
 * a crash reported more than once in one task is recorded once.
 *
 * Hermes exposes one promise-rejection tracker slot and no way to read it:
 * `HermesInternal` is frozen (its methods non-writable and non-configurable,
 * the object non-extensible) and the global that names it is non-writable
 * and non-configurable too (`lib/VM/JSLib/HermesInternal.cpp`,
 * `lib/VM/JSLib/GlobalObject.cpp`), so the installer cannot be wrapped from
 * JavaScript and whoever held the slot before `init()` is unknowable. The
 * host hands that tracker over as `errors.previousRejectionTracker` and ours
 * runs it after recording; `errors.unhandledRejections: false` leaves the
 * slot alone. Without either, a development build is told once per process.
 */
export declare const installErrorCapture: (options: ErrorCaptureOptions) => ErrorCaptureHandle;
