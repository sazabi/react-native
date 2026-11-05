import type { ClientEvent } from "./client-sdk-core/index.js";
import { type CurrentScreen } from "./process-state.js";
import type { NavigationContainerRefLike } from "./types.js";
/** The route the user is on, stamped on every row as `app.screen.*`. */
export declare const getCurrentScreen: () => CurrentScreen;
/**
 * Bound at start, cleared at shutdown; navigation tracked before init still
 * updates the screen. `redactUrl` is the core's redaction with the app's
 * `network.redactQueryParams`: a deep-link route path can carry a query
 * string (`/reset-password?token=…`), so it is recorded like any other URL.
 */
export declare const setNavigationEmitter: (emit: ((event: ClientEvent) => void) | undefined, redactUrl?: (url: string) => string) => void;
/**
 * Screen changes come from the navigator the app already owns. Subscribes to
 * a React Navigation container ref's `state` event (expo-router exposes the
 * same ref) and emits a `navigation` row from `getCurrentRoute()`: the route
 * name, the pathname when the router has one, and the param keys, never the
 * values. A state change that lands on the same route (a param update, a
 * nested navigator settling) emits nothing; a new push of the same screen
 * has a new route key and is a new visit. Returns the unsubscribe.
 */
export declare const trackNavigation: (ref: NavigationContainerRefLike) => (() => void);
/** Test and shutdown hook: forget the screen so a later init starts clean. */
export declare const resetNavigationState: () => void;
