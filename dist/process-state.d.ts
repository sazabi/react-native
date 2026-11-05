import type { ClientEvent, EventSeverity, PointerTracker } from "./client-sdk-core/index.js";
export interface SdkInstance {
    identify(distinctId: string, traits?: Record<string, unknown>): void;
    reset(): void;
    addEvent(name: string, attributes?: Record<string, unknown>): void;
    log(severity: EventSeverity, message: string, metadata?: Record<string, unknown>): void;
    flush(): Promise<void>;
    shutdown(): Promise<void>;
}
interface PendingIdentity {
    distinctId: string;
    traits?: Record<string, unknown>;
}
export interface CurrentScreen {
    name?: string;
    path?: string;
    /** The navigator's per-visit route key: two pushes of one screen are two visits. */
    key?: string;
}
interface SdkState {
    instance?: SdkInstance;
    initialized: boolean;
    warnedWebHost: boolean;
    /** Bumped by every init() and shutdown(), so a consent promise that resolves after a shutdown starts nothing. */
    generation: number;
    pendingIdentity?: PendingIdentity;
    pendingReset: boolean;
    /** The running instance's pointer tracker, fed by every `<SazabiRoot>`. */
    tracker?: PointerTracker;
    /** Where `<SazabiRoot>` reports a render or commit error it caught. */
    renderErrorSink?: (error: unknown) => void;
    /** Where `trackNavigation()` sends its rows. */
    navigationEmit?: (event: ClientEvent) => void;
    /** Applied to the route path a navigation row records: a deep link can carry a query string. */
    navigationRedactUrl?: (url: string) => string;
    /** The route the user is on, stamped on every row as `app.screen.*`. */
    screen: CurrentScreen;
    /** The development note about the unreadable rejection slot, printed once per process. */
    warnedRejectionSlot: boolean;
}
/**
 * Process-wide, not module-wide: a second evaluation of this module (a
 * duplicate copy in the bundle, a module registry reset in development)
 * finds the running instance instead of installing a second `ErrorUtils`
 * handler, rejection tracker, and transport beside it, and a `<SazabiRoot>`
 * or `trackNavigation()` imported from that copy feeds the running instance.
 */
export declare const state: SdkState;
export {};
