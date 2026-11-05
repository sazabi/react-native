/**
 * @sazabi/client-sdk-core: the platform-neutral half of the Sazabi client
 * SDKs. Private and bundled into @sazabi/browser and @sazabi/react-native at
 * build time; never published, never imported by anything else. Compiles
 * without the DOM lib (see host-globals.d.ts), so a browser global here is a
 * typecheck error.
 */
export { flattenAttributes, truncateValue } from "./attributes.js";
export { monotonicNow } from "./clock.js";
export { type ConsoleCaptureHandle, type ConsoleCaptureOptions, installConsoleCapture, withoutConsoleCapture, } from "./console.js";
export { intakeBaseFromUrl, publicKeyFromIntakeUrl, type ResolvedIntakeEndpoint, resolveIntakeEndpoint, } from "./intake-url.js";
export { activateNetworkCapture, consumeWrapperSeen, deactivateNetworkCapture, emitNetworkEvent, ensureXhrPatch, getActiveNetworkCapture, isAborted, isActiveInjectionTarget, isAllowedForInjection, type NetworkCaptureOptions, type NetworkEventDetails, readRequestId, recordWrapperRequest, redactUrl, resetWrapperLedger, severityForStatus, uninstallXhrPatch, urlPath, } from "./network-capture.js";
export { isWrapped, markWrapped, WRAPPED_MARKER } from "./patch-marker.js";
export { createPointerTracker, type DerivedTap, type PointerContact, type PointerTarget, type PointerTracker, type PointerTrackerOptions, type PointerType, } from "./pointer.js";
export { createRandomBytes, newPrefixedId, type RandomBytes, randomHex, toHex, } from "./random.js";
export { createMemoryStore, createSessionManager, type SessionManager, type SessionManagerOptions, type SessionStore, } from "./session.js";
export { createTraceContextManager, type HostSpanContext, readHostSpanContext, type RequestTraceContext, type TraceContextManager, } from "./trace-context.js";
export { createSdkHealthReporter, SDK_DIAGNOSTIC_KEY, type SdkHealthDiagnostic, type SdkHealthReport, type SdkHealthReporter, } from "./sdk-health.js";
export { createTransport, encodeLogRecord, type FetchLike, type OtlpLogRecord, type Transport, type TransportOptions, } from "./transport.js";
export { isUnderBase, type ParsedUrl, parseAbsoluteUrl } from "./url.js";
export { createBeforeSendGate } from "./before-send.js";
export type { AttributeValue, BeforeSend, ClientEvent, ClientEventType, ConsoleCaptureConfig, ConsoleCaptureLevel, EventAttributes, EventSeverity, NetworkCaptureConfig, PointerCaptureConfig, } from "./types.js";
