import { type RandomBytes } from "./random.js";
/**
 * Synchronous key-value access the session machine reads through on every
 * call. A browser binding backs it with `localStorage` (so sibling tabs
 * converge) and `sessionStorage`; a mobile binding backs it with an
 * in-memory mirror hydrated from its storage adapter and written through.
 */
export interface SessionStore {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
}
/** A store that lives for the process only: the fallback on every host. */
export declare const createMemoryStore: () => SessionStore;
export interface SessionManager {
    getSessionId(): string;
    getWindowId(): string;
    getDistinctId(): string | undefined;
    /**
     * Set the client-asserted identity. Switching from one identity directly
     * to a different one rotates the session and window ids so two users on a
     * shared device never thread into one timeline.
     */
    setDistinctId(distinctId: string): void;
    /** Logout: clear identity and rotate both session and window ids. */
    reset(): void;
    /** Record user activity; may rotate the session on idle/max-age expiry. */
    touch(): void;
}
export interface SessionManagerOptions {
    /** Visit-scoped state: session id and identity. */
    store: SessionStore;
    /** Window-scoped state: one browser tab, or one app launch. */
    windowStore: SessionStore;
    randomBytes: RandomBytes;
}
/**
 * Session identity. `session.id` is the visit (last-writer-wins on rotation
 * races between windows; a split session is cosmetic, not data loss).
 * `session.window_id` is this window. `session.distinct_id` is read through
 * the store so identify/reset in one window is visible to siblings on their
 * next event.
 */
export declare const createSessionManager: (options: SessionManagerOptions) => SessionManager;
