import { type RandomBytes } from "./random.js";
export interface RequestTraceContext {
    /** Headers to inject (`traceparent`, and `tracestate` when present). */
    headers: Record<string, string>;
    traceId: string;
    spanId: string;
}
export interface TraceContextManager {
    /** Trace context for one outgoing request, minted at request time. */
    forRequest(): RequestTraceContext;
}
/** The subset of an OTel SpanContext this module consumes. */
export interface HostSpanContext {
    traceId: string;
    spanId: string;
    traceFlags: number;
    traceState?: {
        serialize(): string;
    };
}
export declare const readHostSpanContext: () => HostSpanContext | undefined;
/**
 * W3C trace context for outgoing requests: hand-rolled header formatting
 * (equivalence-tested against OTel's W3CTraceContextPropagator), zero
 * runtime dependencies. If the host app runs its own OTel and has an active
 * span, that span's context (including its flags and tracestate) is reused
 * so we join the customer's trace instead of forking a new one; otherwise a
 * fresh root is minted with the sampled flag defaulting to off (`-00`).
 */
export declare const createTraceContextManager: (options: {
    sampledFlag: boolean;
    randomBytes: RandomBytes;
}) => TraceContextManager;
