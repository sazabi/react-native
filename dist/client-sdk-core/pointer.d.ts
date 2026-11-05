import { type RandomBytes } from "./random.js";
import type { ClientEvent } from "./types.js";
/**
 * Pointer episodes: one row per contact from down to up, for mouse, touch,
 * and pen alike. A binding feeds raw contacts in (DOM pointer events in the
 * browser, the responder's touch arrays on mobile) and the tracker emits the
 * episode rows plus the derived `click` and `rage_click` rows. Movement is
 * sampled, never streamed: a position sample every `sampleIntervalMs` is
 * packed into the row, and a contact that outlives `partialIntervalMs` emits
 * a partial row at that cadence so a long scroll is not a blind spot.
 */
export type PointerType = "mouse" | "touch" | "pen";
export interface PointerTarget {
    /** Developer-authored name for the widget under the pointer, if any. */
    name?: string;
    /** Stable-ish identifier: a selector on the web, a component path on mobile. */
    id?: string;
    /** Element tag or component kind. */
    tag?: string;
    /** Whether a tap here is on something that should respond. */
    interactive: boolean;
}
export interface PointerContact {
    id: number | string;
    type: PointerType;
    primary: boolean;
    x: number;
    y: number;
    pressure?: number;
    /**
     * The button that started a mouse contact (DOM `button`: 0 primary, 1
     * auxiliary, 2 secondary). Absent for touch and pen. Only a primary-button
     * contact can derive a click: a short right or middle press is an episode
     * without a tap, matching the host's `contextmenu` and `auxclick`.
     */
    button?: number;
    target?: PointerTarget;
}
export interface DerivedTap {
    x: number;
    y: number;
    target?: PointerTarget;
    /** Absent for a tap no contact produced (keyboard activation, script). */
    gestureId?: string;
}
export interface PointerTrackerOptions {
    emit(event: ClientEvent): void;
    randomBytes: RandomBytes;
    /** Spacing of packed position samples. Default 1000. */
    sampleIntervalMs?: number;
    /** Cadence of partial rows for long contacts. Default 10000. */
    partialIntervalMs?: number;
    /** Every derived tap, so a binding can run its own dead-tap detection. */
    onTap?(tap: DerivedTap): void;
}
export interface PointerTracker {
    down(contact: PointerContact): void;
    move(id: number | string, x: number, y: number, pressure?: number): void;
    up(id: number | string, x: number, y: number): void;
    cancel(id: number | string): void;
    /**
     * A click that no pointer contact produced: keyboard activation or a
     * script calling `click()`. Emits the `click` row and runs the same rage
     * and dead-tap derivation, with no episode behind it.
     */
    tap(tap: {
        x: number;
        y: number;
        target?: PointerTarget;
    }): void;
    teardown(): void;
}
export declare const createPointerTracker: (options: PointerTrackerOptions) => PointerTracker;
