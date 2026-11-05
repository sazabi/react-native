import type { BeforeSend, ClientEvent } from "./types.js";
/**
 * The host's `beforeSend` hook, run so that it can never break the SDK: a
 * hook that throws or returns something other than an event drops the event
 * (a hook that redacts must not fail open) and warns once per reason. An
 * event captured synchronously while the hook runs (a `log()` or
 * `addEvent()` call inside it) is dropped rather than sent around the hook
 * or fed back into it, so a hook can never recurse. A request the hook
 * starts completes later and produces an ordinary network event the hook
 * sees like any other; the hook is responsible for excluding it.
 */
export declare const createBeforeSendGate: (hook: BeforeSend | undefined, warnOnce: (warning: {
    reason: string;
    message: string;
}) => void) => ((event: ClientEvent) => ClientEvent | null);
