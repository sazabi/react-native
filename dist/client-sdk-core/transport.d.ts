import type { SdkHealthReport } from "./sdk-health.js";
import type { ClientEvent, EventAttributes, EventSeverity } from "./types.js";
type OtlpAnyValue = {
    stringValue: string;
} | {
    intValue: string;
} | {
    doubleValue: number;
} | {
    boolValue: boolean;
};
interface OtlpKeyValue {
    key: string;
    value: OtlpAnyValue;
}
export interface OtlpLogRecord {
    timeUnixNano: string;
    severityNumber: number;
    severityText: EventSeverity;
    body: {
        stringValue: string;
    };
    attributes: OtlpKeyValue[];
    /** OTLP/JSON encodes trace/span ids as hex (unlike proto3 JSON's base64). */
    traceId?: string;
    spanId?: string;
}
export declare const encodeLogRecord: (event: ClientEvent, baseAttributes: EventAttributes) => OtlpLogRecord;
/**
 * The slice of `fetch` the transport uses. Declared structurally so the core
 * needs no DOM lib; every host's real `fetch` satisfies it.
 */
export type FetchLike = (url: string, init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
    keepalive: boolean;
    /** An `AbortSignal` where the host has `AbortController`; aborts a timed-out upload. */
    signal?: unknown;
}) => Promise<unknown>;
/**
 * UTF-8 byte length of a string, without `TextEncoder` (Hermes has none).
 * Request budgets are bytes on the wire; a string's `length` counts UTF-16
 * units and undercounts non-ASCII text up to threefold.
 */
export declare const utf8Length: (text: string) => number;
/** Stamped on the first row delivered after events were dropped: how many. */
export declare const DROPPED_EVENTS_KEY = "app.sdk.dropped_events";
/**
 * Names the sending SDK on every upload, `<package>/<version>`: the input
 * for the intake gateway's per-SDK request label (a separate change), which
 * can then count a request by SDK even when it rejects it before the key is
 * known. The gateway's CORS allow-list admits it, so a browser preflight
 * passes.
 */
export declare const SDK_HEADER = "x-sazabi-sdk";
export interface TransportOptions {
    /** Full OTLP logs endpoint, e.g. `https://<key>.<region>.intake.<domain>/v1/logs`. */
    url: string;
    publicKey: string;
    resourceAttributes: EventAttributes;
    /** OTLP instrumentation scope: the emitting SDK's name and version. */
    scope: {
        name: string;
        version: string;
    };
    /**
     * The fetch to deliver with, captured before the SDK's network patch
     * installs, so exporter traffic can never recurse through our own wrapper
     * or appear in the captured event stream.
     */
    fetchImpl: FetchLike;
    flushIntervalMs: number;
    maxBatchBytes: number;
    maxQueuedEvents: number;
    /** Reports a dropped batch or a full queue; called once per reason. */
    warn?(message: string): void;
    /**
     * The SDK's own delivery health: a batch the intake refused for good
     * (`intake_rejected`, with the status) and uploads that failed on the
     * network before one got through (`intake_unreachable`, with the number
     * of failed tries). The binding turns these into `sdk_health` rows, once
     * per condition per session.
     */
    onHealth?(report: SdkHealthReport): void;
    /**
     * Called when an upload settles with nothing queued, nothing in flight, and
     * every row of the last `snapshotEnvelopes` delivered or refused for good:
     * a saved row evicted from the full queue, or given up by `shutdown()`
     * while the intake was unreachable, keeps it from firing until the next
     * snapshot, so the host's saved copy stays.
     */
    onIdle?(): void;
}
export interface Transport {
    enqueue(record: OtlpLogRecord): void;
    /**
     * Deliver everything queued. `keepalive: true` is for browser unload paths;
     * each request body must stay inside the browser's ~64 KiB keepalive
     * budget, which enqueue-side chunking guarantees via `maxBatchBytes`. Hosts
     * without keepalive ignore the flag.
     */
    flush(options?: {
        keepalive?: boolean;
    }): Promise<void>;
    /**
     * Encode everything queued into standalone request bodies without sending,
     * leaving the queue empty. The mobile crash outbox persists these and posts
     * them on the next launch; `recordAttributes` are appended to every record
     * (the outbox stamps its replay id there).
     */
    drainEnvelopes(recordAttributes?: EventAttributes): string[];
    /**
     * Encode everything queued into standalone request bodies and keep it
     * queued. `recordAttributes` are stamped on the queued records themselves,
     * so the live upload and the saved copy carry the same values (the mobile
     * SDK saves its queue this way when the app leaves the foreground). Rows an
     * earlier snapshot saved whose upload is still in flight are included as
     * they were sent: the copy this one replaces held them.
     */
    snapshotEnvelopes(recordAttributes: EventAttributes): string[];
    /**
     * While held, `enqueue` never flushes on its own, neither on the byte
     * budget nor by scheduling the timer: the mobile crash path holds the
     * transport while it stamps the fatal row and everything buffered before
     * it, then drains the whole batch into the outbox. Without this, a fatal
     * row that tips the queue over the budget would be flushed out of the queue
     * into a request the dying process never completes.
     */
    holdFlushes(hold: boolean): void;
    /**
     * Deliver a previously drained envelope. Resolves `true` once the envelope
     * is settled: the intake accepted it (2xx) or refused it for good (a 4xx
     * other than 408 and 429, dropped with a warning). Resolves `false` when it
     * is worth sending again (408, 429, 5xx, a network failure, a timeout), and
     * never rejects, so a persisted envelope is deleted only once settled.
     */
    sendEnvelope(body: string): Promise<boolean>;
    shutdown(): Promise<void>;
}
export declare const createTransport: (options: TransportOptions) => Transport;
export {};
