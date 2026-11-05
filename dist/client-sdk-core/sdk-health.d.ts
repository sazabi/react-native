import type { ClientEvent, EventAttributes } from "./types.js";
/**
 * What an `sdk_health` row reports: the SDK's own delivery trouble, so a
 * misconfigured or unreachable app is visible to Sazabi before the customer
 * reports it. Each value is a bounded enumeration, never free text.
 *
 *  - `intake_rejected`: the intake refused a batch for good (a 4xx other
 *    than 408 and 429); `app.sdk.http_status` carries the status.
 *  - `intake_unreachable`: uploads failed on the network (a dropped
 *    connection, a timeout) and the intake later answered; `app.sdk.attempts`
 *    is how many backoff windows the outage spanned (one per failed try,
 *    with concurrent uploads failing together counted once).
 *  - `outbox_discarded`: stored crash reports were dropped, by the caps or
 *    because they were not valid reports; `app.sdk.outbox_discarded` counts
 *    what is known lost, and `app.sdk.outbox_unsaved` what a saved queue had
 *    left out at the caps (possible losses: their live upload may have
 *    finished before the app was killed) (mobile only).
 *  - `outbox_persist_failed`: the storage adapter refused a write of the
 *    crash outbox or the saved queue (mobile only).
 */
export type SdkHealthDiagnostic = "intake_rejected" | "intake_unreachable" | "outbox_discarded" | "outbox_persist_failed";
export interface SdkHealthReport {
    diagnostic: SdkHealthDiagnostic;
    /** The counters of the condition (`app.sdk.http_status`, `app.sdk.attempts`, ...). */
    attributes?: EventAttributes;
}
export type SdkHealthReporter = (report: SdkHealthReport) => void;
export declare const SDK_DIAGNOSTIC_KEY = "app.sdk.diagnostic";
/**
 * Turns health reports into `sdk_health` rows, at most one per diagnostic
 * for the life of the reporter (one SDK session). The bound is what keeps
 * the SDK from storming its own intake: a health row the intake refuses is
 * a rejection like any other and is never reported again, and a flapping
 * network produces one row per launch, not one per outage. Never throws
 * into the host.
 */
export declare const createSdkHealthReporter: (emit: (event: ClientEvent) => void) => SdkHealthReporter;
