export const TOKEN_KEY = "session";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const LAST_LOGIN_EMAIL_KEY = "lastLoginEmail";
export const PIN_HASH_KEY = "zorah.pin_hashed";
export const PIN_LOCKOUT_KEY = "zorah.pin_lockout";

/**
 * Digits in a PIN. Single source of truth — this used to be declared
 * separately in PinSetupScreen, LockScreen and TransferScreen.
 */
export const PIN_LENGTH = 4;

/**
 * How long a locally cached PIN verifier is trusted before the next unlock is
 * sent to the server instead.
 *
 * The server is the source of truth, but we cache a verifier so unlocking
 * works offline. If the user changes their PIN on another device this cache
 * goes stale, and there is no `pinVersion` field to detect that — so bound the
 * staleness with a TTL. See lib/pinStorage.ts.
 */
export const PIN_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
