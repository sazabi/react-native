import { type EventAttributes } from "./client-sdk-core/index.js";
/**
 * react-native-web renders in a real browser, where `@sazabi/browser` owns
 * capture. This SDK installs nothing there.
 */
export declare const isWebHost: () => boolean;
/**
 * Resource attributes the host can report without a native module: OTEL
 * `os.*` from `Platform`, the `device.*` fields Android's
 * `Platform.constants` carries (`Brand`, `Manufacturer`, `Model`), and on iOS
 * the manufacturer plus `device.type` from `interfaceIdiom` (`phone`, `pad`,
 * `tv`, `carplay`, `mac`, `vision`). iOS reports no model through JavaScript.
 * `os.name` stays `Platform.OS` (`ios`, `android`) on both, so queries match
 * one casing; iPadOS shows as `device.type: "pad"`.
 */
export declare const hostResourceAttributes: () => EventAttributes;
export declare const isDevHost: () => boolean;
/**
 * The Metro (or Expo) development server this bundle was loaded from, as
 * `<origin>/`, read from `SourceCode.scriptURL` the way React Native's own
 * `getDevServer()` does. Only under `__DEV__`, and only for an http(s)
 * bundle URL: a release bundle loads from a file.
 */
export declare const devServerOrigin: () => string | undefined;
/**
 * A request URL as the core expects it: absolute, credentials stripped.
 * Relative references are not requests on a native host, so they resolve to
 * nothing and are neither captured nor injected.
 */
export declare const resolveUrl: (raw: string) => string | undefined;
