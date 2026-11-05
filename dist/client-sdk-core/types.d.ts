export type AttributeValue = string | number | boolean;
export type EventAttributes = Record<string, AttributeValue | undefined>;
export type EventSeverity = "DEBUG" | "INFO" | "WARN" | "ERROR";
/**
 * The shared `app.event_type` vocabulary. Every value means the same thing
 * on every host; a binding that cannot produce one simply never emits it.
 */
export type ClientEventType = "navigation" | "pointer" | "click" | "rage_click" | "dead_click" | "input" | "network" | "error" | "custom" | "log" | "lifecycle"
/** The SDK's own delivery health, one row per condition per session (`sdk-health.ts`). */
 | "sdk_health";
/** An SDK-internal semantic event, before OTLP encoding. */
export interface ClientEvent {
    type: ClientEventType;
    body: string;
    severity: EventSeverity;
    timeUnixMs: number;
    /** Set on network events when trace context was injected into the request. */
    traceId?: string;
    spanId?: string;
    attributes: EventAttributes;
}
/**
 * Runs on every event before it is queued. Return the event (edited or as
 * given) to send it, or `null` to drop it. The hook sees the event's own
 * attributes; the session and page fields are stamped afterwards.
 */
export type BeforeSend = (event: ClientEvent) => ClientEvent | null;
export type ConsoleCaptureLevel = "error" | "warn" | "info" | "debug";
export interface ConsoleCaptureConfig {
    /** Mirror console output into the event stream. Default true. */
    capture?: boolean;
    /** Console levels to mirror. Default ["error", "warn"]. */
    levels?: ConsoleCaptureLevel[];
}
export interface PointerCaptureConfig {
    /** Emit one `pointer` episode per contact, plus derived taps. Default true. */
    capture?: boolean;
    /** Spacing of the position samples packed into an episode. Default 1000. */
    sampleIntervalMs?: number;
    /**
     * A contact open longer than this emits a partial row at this cadence so a
     * long scroll or drag is not a blind spot until release. Default 10000.
     */
    partialIntervalMs?: number;
}
/** Network options every binding shares; a binding may extend the shape. */
export interface NetworkCaptureConfig {
    /** Emit network events. Default true. */
    capture?: boolean;
    /** Inject W3C `traceparent` into allowlisted requests. Default true. */
    propagateTraceContext?: boolean;
    /**
     * Response headers probed (in order) for a platform request id to attach
     * as `app.network.request_id`, an exact join key against platform logs.
     */
    requestIdHeaders?: string[];
    /**
     * Requests eligible for `traceparent` injection. A string is a host
     * (`api.example.com`), a domain with every subdomain (`.example.com`), or
     * an origin with an optional path prefix (`https://api.example.com/v2`); a
     * RegExp is tested against the full URL. An empty list falls back to the
     * binding's default policy (same-origin in the browser, every request on
     * mobile).
     */
    allowlist?: (string | RegExp)[];
    /**
     * Query parameter names whose values are replaced with `[redacted]` in
     * every recorded URL: `url.full` of requests and navigations, the screen or
     * page URL stamped on each event (`app.screen.url`), and in the browser the
     * referrer (`app.navigation.from`). Beside the default list (token, access_token, refresh_token,
     * id_token, api_key, apikey, key, secret, password, signature, sig,
     * x-amz-signature, x-amz-credential, x-goog-signature, sentry_key,
     * authorization, auth, session, sid, code). Strings match a name exactly,
     * case-insensitively; RegExps are tested against the name.
     */
    redactQueryParams?: (string | RegExp)[];
    /**
     * Set the sampled flag (`-01`) on SDK-minted trace roots. Default false:
     * the sampled bit steers customers' ParentBased backend samplers.
     */
    sampledFlag?: boolean;
}
