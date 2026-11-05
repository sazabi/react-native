/**
 * Resolving the intake endpoint from a single URL.
 *
 * Every Sazabi log source is configured with one intake URL, and public keys
 * stay a low-level detail customers never handle. The key is already in the
 * URL: the intake edge reconstructs it from the hostname
 * (terraform/main/cloudfront-functions/intake-router.js), so the SDK does the
 * same reconstruction locally and sends the Bearer header itself.
 *
 * Two keyed shapes exist, matching the edge's two grammars:
 *   {hex}.{region}.intake.{domain}            prefixless (what log sources issue)
 *   {adapter}-{hex}.{region}.intake.{domain}  keyed-adapter (legacy, still served)
 *
 * A URL in neither shape is not an error: it may be a proxy or a custom
 * endpoint. The SDK then requires an explicit `publicKey`, so a
 * misconfiguration surfaces as a clear warning rather than silent no-auth.
 */
export interface ResolvedIntakeEndpoint {
    /**
     * Base to POST to: origin plus any proxy path prefix, no trailing slash.
     * The transport appends `/v1/logs`.
     */
    baseUrl: string;
    /** Credential for the Authorization header, derived or explicit. */
    publicKey: string;
}
/** Public key embedded in a keyed intake hostname, if it carries one. */
export declare const publicKeyFromIntakeUrl: (url: string) => string | undefined;
export declare const intakeBaseFromUrl: (url: string) => string | undefined;
/**
 * Resolve the endpoint from config. An explicit `publicKey` always wins, so a
 * non-keyed or proxied endpoint stays configurable.
 */
export declare const resolveIntakeEndpoint: (config: {
    intakeUrl?: string;
    intakeHost?: string;
    publicKey?: string;
}) => ResolvedIntakeEndpoint | undefined;
