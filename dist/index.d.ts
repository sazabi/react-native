import { type EventSeverity } from "./client-sdk-core/index.js";
import { SazabiRoot } from "./interactions.js";
import { trackNavigation } from "./navigation.js";
import type { ReactNativeSdkConfig } from "./types.js";
export type { AttributeValue, BeforeSend, ClientEvent, ClientEventType, ConsoleCaptureConfig, ConsoleCaptureLevel, ErrorCaptureConfig, RejectionTracker, EventAttributes, EventSeverity, NavigationContainerRefLike, NetworkCaptureConfig, PointerCaptureConfig, ReactNativeSdkConfig, StorageAdapter, } from "./types.js";
export { SazabiRoot, trackNavigation };
declare module "react-native" {
    interface ViewProps {
        /** Names this element in touch rows (`app.widget.name`), ahead of `accessibilityLabel` and `testID`. */
        sazabiName?: string;
        /** Keeps the name of this element and everything inside it out of touch rows. */
        sazabiMask?: boolean;
    }
    interface TextProps {
        /** Names this element in touch rows (`app.widget.name`), ahead of `accessibilityLabel` and `testID`. */
        sazabiName?: string;
        /** Keeps the name of this element and everything inside it out of touch rows. */
        sazabiMask?: boolean;
    }
    interface TouchableWithoutFeedbackProps {
        /** Names this element in touch rows (`app.widget.name`), ahead of `accessibilityLabel` and `testID`. */
        sazabiName?: string;
        /** Keeps the name of this element and everything inside it out of touch rows. */
        sazabiMask?: boolean;
    }
}
export { SDK_VERSION } from "./version.js";
/**
 * Initialize the SDK. Idempotent: repeat calls are ignored. Installs nothing
 * under react-native-web (use `@sazabi/browser` there). When `consent` is
 * provided, nothing is installed until it resolves true.
 */
export declare const init: (config: ReactNativeSdkConfig) => void;
/** Set the client-asserted user identity (`session.distinct_id`). */
export declare const identify: (distinctId: string, traits?: Record<string, unknown>) => void;
/**
 * Logout: clear the client-asserted identity and rotate both session and
 * window ids, so later activity on this device never threads into the
 * previous user's timeline.
 */
export declare const reset: () => void;
/** Emit a custom mark into the session event stream. */
export declare const addEvent: (name: string, attributes?: Record<string, unknown>) => void;
/**
 * Emit an application log line (`app.event_type: "log"`) with session context
 * attached. Drops silently before init/consent, like all capture.
 */
export declare const log: (severity: EventSeverity, message: string, metadata?: Record<string, unknown>) => void;
/** Force-flush queued events. */
export declare const flush: () => Promise<void>;
/** Tear down all patches/listeners (restoring originals) and flush. */
export declare const shutdown: () => Promise<void>;
