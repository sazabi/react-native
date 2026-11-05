export type RandomBytes = (length: number) => Uint8Array;
/**
 * Random bytes for session, trace, and gesture ids. Web Crypto where the host
 * has it; a seeded fallback where it does not (React Native without a
 * `crypto.getRandomValues` polyfill). The ids need uniqueness, not secrecy,
 * so the fallback is acceptable there and is never used where crypto exists.
 */
export declare const createRandomBytes: () => RandomBytes;
export declare const toHex: (bytes: Uint8Array) => string;
export declare const randomHex: (randomBytes: RandomBytes, byteLength: number) => string;
export declare const newPrefixedId: (randomBytes: RandomBytes, prefix: string) => string;
