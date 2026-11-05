import type { PointerTarget, PointerTracker } from "./client-sdk-core/index.js";
import { Component, createElement, type ReactNode } from "react";
/**
 * Touch capture for the pointer-episode tracker. `<SazabiRoot>` is a plain
 * `View` that observes every touch bubbling up from the app without claiming
 * the responder, so gestures reach their targets untouched. It works
 * wherever it is mounted and whenever `init()` runs: touches before activation
 * are dropped, never queued.
 */
export declare const setActiveTracker: (tracker: PointerTracker | undefined) => void;
export declare const describeFiberTarget: (targetInstance: unknown) => PointerTarget | undefined;
/**
 * Wrap the app's root in this once, outside every other component. It
 * renders a single full-size `View` with touch observers, and is the error
 * boundary that records a render or commit error as a `fatal` row (crash
 * outbox included) before rethrowing it: under React 19 such an error never
 * reaches `ErrorUtils`, so without this boundary a release app dies with
 * nothing recorded. The rethrow leaves React Native's own handling (the red
 * box in development, the native crash in release) exactly as it was.
 */
export declare class SazabiRoot extends Component<{
    children?: ReactNode;
}, {
    error?: {
        value: unknown;
    };
}> {
    static displayName: string;
    state: {
        error?: {
            value: unknown;
        };
    };
    static getDerivedStateFromError(error: unknown): {
        error: {
            value: unknown;
        };
    };
    render(): ReturnType<typeof createElement>;
}
