import type { SdkHealthReporter, Transport } from "./client-sdk-core/index.js";
import type { StorageAdapter } from "./types.js";
export declare const OUTBOX_INDEX_KEY = "sazabi.outbox.index";
/** Stamped on every record of a stashed batch; a re-sent copy carries the same value. */
export declare const OUTBOX_REPLAY_ID_KEY = "app.outbox.id";
/**
 * Route the outbox's health reports to the running instance. Set before
 * `loadOutbox`, so what the first read discards is reported on this launch.
 */
export declare const watchOutbox: (adapter: StorageAdapter, report: SdkHealthReporter) => void;
/** The instance is gone: nothing it would have reported is reported. */
export declare const unwatchOutbox: (adapter: StorageAdapter, report: SdkHealthReporter) => void;
/**
 * Read the stored outbox once per adapter. Started by `init()` before any
 * capture installs: a synchronous adapter is loaded before this returns, so
 * a crash at any later point merges into the stored report instead of
 * writing beside it.
 */
export declare const loadOutbox: (adapter: StorageAdapter, warn?: (message: string) => void) => Promise<void>;
/**
 * The crash outbox replaces the browser's keepalive flush. A fatal JavaScript
 * error terminates the process shortly after the global handler returns, so
 * the pending queue (the error row included) is encoded into standalone
 * envelopes stamped with one replay id and written to storage: the batch's
 * own key first, then the index that lists it.
 *
 * Nothing the dying process sends can be cleared afterwards: an upload the
 * intake accepted just before the process died would be posted again by the
 * next launch. So when a synchronous adapter took both writes (`true`),
 * nothing is sent here; the caller delivers the outbox once the process has
 * proved it survived, and otherwise the next `init()` does. A
 * promise-returning adapter may never finish the writes, so its batch is
 * also sent at once, and a copy the next launch re-sends carries the same
 * replay id. The saved queue goes once both writes were accepted (every row
 * it held is in this batch), never before: a store that refuses the batch
 * near its limit must not cost the only copy of those rows.
 */
export declare const stashOutbox: (adapter: StorageAdapter, transport: Transport, replayId: string) => boolean;
/** Post everything the outbox holds once the stored keys have been read. */
export declare const deliverOutbox: (adapter: StorageAdapter, transport: Transport) => Promise<void>;
/**
 * Save the live queue, within the outbox caps, as the app leaves the
 * foreground: the OS may kill a backgrounded app without another callback,
 * and an offline queue would die with it. The queued records are stamped
 * with the replay id, so the live upload and the copy a later launch sends
 * share it. Not before the previous launch's saved queue has been read.
 */
export declare const saveQueue: (adapter: StorageAdapter, transport: Transport, replayId: string) => void;
/**
 * `transport`'s live queue was delivered (or stashed by a crash): its saved
 * copy goes, unless the key now holds another transport's queue.
 */
export declare const clearQueue: (adapter: StorageAdapter, transport: Transport) => void;
