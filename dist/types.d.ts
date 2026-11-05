import type { BeforeSend, ConsoleCaptureConfig, NetworkCaptureConfig as CoreNetworkCaptureConfig, PointerCaptureConfig } from "./client-sdk-core/index.js";
export type { AttributeValue, BeforeSend, ClientEvent, ClientEventType, ConsoleCaptureConfig, ConsoleCaptureLevel, EventAttributes, EventSeverity, PointerCaptureConfig, } from "./client-sdk-core/index.js";
/**
 * Persistent key-value storage the SDK writes sessions, identity, and the
 * crash outbox to. `@react-native-async-storage/async-storage`, MMKV
 * wrappers, and `expo-sqlite/kv-store` all satisfy it; a synchronous store
 * makes the crash outbox reliable on a fatal error.
 */
export interface StorageAdapter {
    getItem(key: string): string | null | Promise<string | null>;
    setItem(key: string, value: string): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
    /**
     * Every key the store holds (AsyncStorage's `getAllKeys`, MMKV's
     * `getAllKeys`). Optional: with it, a launch recovers a crash report whose
     * own key was written but whose index entry never landed because the
     * process died between the two writes. Without it such a report is lost.
     */
    getAllKeys?(): readonly string[] | Promise<readonly string[]>;
}
export interface NetworkCaptureConfig extends CoreNetworkCaptureConfig {
    /**
     * Requests eligible for `traceparent` injection. A string is a host
     * (`api.example.com`), a domain with every subdomain (`.example.com`), or
     * an origin with an optional path prefix (`https://api.example.com`); a
     * RegExp is tested against the full URL. Default: every request except
     * the intake endpoint. A native app has no origin and no CORS preflight,
     * so injection is on everywhere unless narrowed here.
     */
    allowlist?: (string | RegExp)[];
}
/**
 * What `HermesInternal.enablePromiseRejectionTracker` takes: the shape every
 * React Native crash reporter installs.
 */
export interface RejectionTracker {
    allRejections: boolean;
    onUnhandled(id: number, rejection: unknown): void;
    onHandled?(id: number): void;
}
export interface ErrorCaptureConfig {
    /**
     * Track unhandled promise rejections through Hermes's rejection tracker.
     * Hermes has one tracker slot, so turn this off when another SDK owns it.
     * Default true.
     */
    unhandledRejections?: boolean;
    /**
     * The tracker another library installed before `init()`, to run after the
     * SDK's own on every rejection. Hermes gives no way to read the slot's
     * occupant (`HermesInternal` is frozen and its global pinned), so `init()`
     * replaces whatever holds it; hand that tracker over here to keep it
     * running. A tracker installed after `init()` replaces the SDK's instead.
     */
    previousRejectionTracker?: RejectionTracker;
}
/** The subset of a React Navigation container ref the SDK subscribes to. */
export interface NavigationContainerRefLike {
    addListener(type: "state", listener: () => void): () => void;
    getCurrentRoute(): {
        key?: string | undefined;
        name: string;
        params?: object | undefined;
        path?: string | undefined;
    } | undefined;
}
export interface ReactNativeSdkConfig {
    /**
     * The project's intake URL, exactly as the log source issues it, e.g.
     * `https://<key>.us-west-2.intake.sazabi.com`. The credential is embedded in
     * the hostname, so this is normally the only endpoint config needed; `/v1/logs`
     * may be included or omitted.
     */
    intakeUrl?: string;
    /**
     * Public ingest key (`sazabi_public_...`). Optional: derived from `intakeUrl`
     * when that URL is a keyed intake host. Set it only for a proxy or custom
     * endpoint whose hostname carries no key.
     */
    publicKey?: string;
    /** Logical service name for the app. */
    serviceName: string;
    /** App version (e.g. the marketing version or a git SHA). */
    serviceVersion?: string;
    /** Deployment environment (e.g. "production"). */
    environment?: string;
    /** Session persistence and the crash outbox. Without it, sessions last one launch. */
    storage?: StorageAdapter;
    network?: NetworkCaptureConfig;
    console?: ConsoleCaptureConfig;
    pointer?: PointerCaptureConfig;
    errors?: ErrorCaptureConfig;
    /**
     * Consent gate: capture holds until this resolves true. When it resolves
     * false the SDK stays dormant.
     */
    consent?: () => boolean | Promise<boolean>;
    /** Batch flush cadence in ms. Default 5000. */
    flushIntervalMs?: number;
    /** Soft cap per OTLP request body in bytes. Default 57344. */
    maxBatchBytes?: number;
    /**
     * Max buffered events (and at most 1 MiB) while the intake is unreachable;
     * the oldest are dropped first and counted in `app.sdk.dropped_events`.
     * Default 500.
     */
    maxQueuedEvents?: number;
    /**
     * Edit or drop events before they are queued: return the event to send it,
     * `null` to drop it. Runs for every event type, `sdk_health` included. A
     * hook that throws drops the event and warns once; an event captured
     * synchronously while the hook runs (a `log()` inside it) is dropped. A
     * request the hook makes produces its own network event later, which the
     * hook sees like any other and must exclude itself.
     */
    beforeSend?: BeforeSend;
}
