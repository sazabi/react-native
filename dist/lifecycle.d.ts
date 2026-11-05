import type { ClientEvent } from "./client-sdk-core/index.js";
export interface LifecycleCaptureOptions {
    emit(event: ClientEvent): void;
    /** The app is leaving the foreground: the mobile unload flush point. */
    onBackground(): void;
}
export interface LifecycleCaptureHandle {
    teardown(): void;
}
/**
 * `AppState` is the mobile lifecycle: `background` and `inactive` are the
 * unload, `active` is the return. Each edge is a `lifecycle` row so the
 * timeline reads causally, and leaving the foreground flushes the queue
 * while the OS still allows network activity.
 */
export declare const installLifecycleCapture: (options: LifecycleCaptureOptions) => LifecycleCaptureHandle;
