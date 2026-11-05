import type { RequestTraceContext, TraceContextManager } from "./trace-context.js";
import type { ClientEvent, EventSeverity } from "./types.js";
/**
 * Everything the network patches need at request time. A binding builds one
 * at init and activates it; the patches themselves install dormant (possibly
 * before init, via a register entrypoint) and consult the active slot per
 * call. Undefined slot = transparent passthrough.
 */
export interface NetworkCaptureOptions {
    emit(event: ClientEvent): void;
    traceContext: TraceContextManager;
    /** Emit network events. */
    capture: boolean;
    /** Inject `traceparent` into allowlisted requests. */
    propagateTraceContext: boolean;
    /** Injection allowlist; empty defers to `isDefaultInjectionTarget`. */
    allowlist: (string | RegExp)[];
    /** Query parameter names redacted from `url.full` beside the default list. */
    redactQueryParams?: (string | RegExp)[];
    /** Response headers probed for a platform request id, in priority order. */
    requestIdHeaders: string[];
    /** SDK-internal endpoints: never captured, never injected. */
    isInternalUrl(url: string): boolean;
    /**
     * Absolute URL for a request target as the host resolves it, with embedded
     * credentials stripped; undefined when the input cannot be parsed.
     */
    resolveUrl(raw: string): string | undefined;
    /** Injection policy when the allowlist is empty (same-origin on the web). */
    isDefaultInjectionTarget(resolved: string): boolean;
    /** Origin elided from the display path in event bodies, if the host has one. */
    displayOrigin?: string;
    /** Host-reported offline state; a failure while offline reads as an abort. */
    isOffline?(): boolean;
}
export declare const activateNetworkCapture: (options: NetworkCaptureOptions) => void;
export declare const deactivateNetworkCapture: () => void;
export declare const getActiveNetworkCapture: () => NetworkCaptureOptions | undefined;
/** Compact display path: pathname when on the display origin, host+path otherwise. */
export declare const urlPath: (resolved: string, displayOrigin?: string) => string;
/** Status 0 means transport failure. */
export declare const severityForStatus: (status: number) => EventSeverity;
/**
 * A recorded URL: the value of every sensitive parameter after the path
 * replaced with `[redacted]`, in the query and in the fragment. `?` separates
 * inside the fragment as well, so a hash router's `#/reset?token=…` is
 * covered. Credentials in the authority are already gone (`resolveUrl`
 * strips them). Applied to `url.full` of requests, resource rows and
 * navigations, and to the page URL the browser SDK stamps on every event.
 */
export declare const redactUrl: (url: string, extra?: (string | RegExp)[]) => string;
export declare const isAllowedForInjection: (options: NetworkCaptureOptions, resolved: string) => boolean;
/** Injection eligibility for the active config; used by the browser's resource
 * observer to decide whether a bypassed request is a diagnosable gap. */
export declare const isActiveInjectionTarget: (resolved: string) => boolean;
export declare const recordWrapperRequest: (url: string) => void;
/** Consume a wrapper-seen record matching this request, if any. */
export declare const consumeWrapperSeen: (url: string, startTime: number) => boolean;
export declare const resetWrapperLedger: () => void;
export interface NetworkEventDetails {
    kind: "fetch" | "xhr";
    method: string;
    resolvedUrl: string;
    status: number;
    durationMs: number;
    severity?: EventSeverity;
    failureMessage?: string;
    injected?: RequestTraceContext;
    requestId?: string;
    requestIdHeader?: string;
}
export declare const emitNetworkEvent: (options: NetworkCaptureOptions, details: NetworkEventDetails) => void;
export declare const readRequestId: (options: NetworkCaptureOptions, getHeader: (name: string) => string | null | undefined) => {
    requestId?: string;
    requestIdHeader?: string;
};
export declare const isAborted: (error: unknown, signalAborted?: boolean, offline?: boolean) => boolean;
/**
 * Install the dormant XMLHttpRequest patch around whatever implementation is
 * currently live. Idempotent, and re-wraps when a later actor replaced the
 * prototype methods after an earlier install (the displaced wrapper is an
 * inert passthrough, so single-processing holds).
 */
export declare const ensureXhrPatch: () => void;
/**
 * Restore the natives if the current implementations are still ours; if
 * someone patched on top of us, restoring would clobber them, and the
 * inactive wrappers pass through.
 */
export declare const uninstallXhrPatch: () => void;
