/**
 * Absolute-URL parsing with no `URL` global. React Native's built-in `URL`
 * throws "not implemented" for `hostname`, `pathname`, and `origin`, and the
 * core must work there unpolyfilled, so the few fields the SDKs read are
 * parsed here. Only absolute http(s)-style URLs resolve; a binding resolves
 * relative references against its own base before calling in.
 */
export interface ParsedUrl {
    /** e.g. `https:` */
    protocol: string;
    /** host with port, no credentials */
    host: string;
    hostname: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
    /** Normalized absolute URL with credentials stripped. */
    href: string;
}
export declare const parseAbsoluteUrl: (raw: string) => ParsedUrl | undefined;
/**
 * Whether `url` is `base` or lies under it: the same origin (scheme, host,
 * port) and, when the base has a path, that path as whole segments. A string
 * prefix would also match `https://intake.example.com.evil.test/`.
 */
export declare const isUnderBase: ({ url, base, }: {
    url: string;
    base: string;
}) => boolean;
