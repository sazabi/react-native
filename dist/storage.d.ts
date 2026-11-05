import { type SessionStore } from "./client-sdk-core/index.js";
import type { StorageAdapter } from "./types.js";
/**
 * Storage adapters may be synchronous (MMKV) or promise-returning
 * (AsyncStorage). Every call here is best-effort: an adapter that throws or
 * rejects degrades the SDK to in-memory state and never surfaces to the app.
 */
export declare const readKey: (adapter: StorageAdapter, key: string) => Promise<string | null>;
export declare const isThenable: (value: unknown) => value is PromiseLike<unknown>;
/** What a read found; `undefined` means the adapter failed to answer. */
export type ReadResult = {
    value: string | null;
} | undefined;
/** Read a key, synchronously when the adapter can, so the crash outbox loads inside `init()`. */
export declare const readKeyNow: (adapter: StorageAdapter, key: string) => ReadResult | Promise<ReadResult>;
/**
 * Every key the adapter holds. `undefined` when the adapter has no listing
 * or it failed: the caller then knows only what the indexes list, never
 * that a key is absent.
 */
export declare const listKeysNow: (adapter: StorageAdapter) => readonly string[] | undefined | Promise<readonly string[] | undefined>;
/**
 * `true` once the adapter accepted the write, `false` when it refused. A
 * synchronous adapter answers synchronously, which is how the crash path
 * knows the batch is on disk before the process can die.
 */
export declare const writeKey: (adapter: StorageAdapter, key: string, value: string) => boolean | Promise<boolean>;
/** `true` once the adapter accepted the removal, synchronously when it can. */
export declare const removeKey: (adapter: StorageAdapter, key: string) => boolean | Promise<boolean>;
export interface HydratingStore {
    /** Synchronous view the session machine reads through. */
    store: SessionStore;
    /** Resolves once every key has been read from the adapter. */
    ready: Promise<void>;
}
/**
 * The session machine needs synchronous reads, so persisted state is read
 * once into an in-memory mirror and every later write goes through to the
 * adapter. A key written locally before hydration finishes keeps the local
 * value: a `reset()` must not be undone by a slow read of the old identity.
 */
export declare const createHydratingStore: (adapter: StorageAdapter, keys: readonly string[]) => HydratingStore;
