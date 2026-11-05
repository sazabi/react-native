import { type NetworkCaptureOptions } from "./client-sdk-core/index.js";
export interface NetworkCaptureHandle {
    teardown(): void;
}
/**
 * React Native's `fetch` is a polyfill over its own `XMLHttpRequest`, so the
 * core's XHR patch alone sees every request this host makes (`fetch`,
 * `axios`, direct XHR) and a `fetch` wrapper would emit each one twice.
 */
export declare const ensureNetworkPatches: () => void;
export declare const uninstallNetworkPatches: () => void;
export declare const installNetworkCapture: (options: NetworkCaptureOptions) => NetworkCaptureHandle;
