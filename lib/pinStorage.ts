import {
  PIN_CACHE_TTL_MS,
  PIN_HASH_KEY,
  PIN_LOCKOUT_KEY,
} from "@/constants/auth";
import {
  secureStoreGetItem,
  secureStoreRemoveItem,
  secureStoreSetItem,
} from "@/lib/persistedStorageConfig";
import {
  PinLockoutState,
  initialLockoutState,
  parseLockout,
  serializeLockout,
} from "@/lib/pinLockout";
import * as Crypto from "expo-crypto";

/**
 * Local PIN verifier cache.
 *
 * The server owns the PIN (`/auth/set-pin`, `/auth/verify-pin`) so it can
 * follow the user across devices. What lives here is a *verifier* that lets us
 * check a PIN offline, because the app locks after 60s of inactivity and a
 * network round-trip per unlock would be felt.
 *
 * v1 stored a bare unsalted SHA256 hex string. A 4-digit PIN is only 10,000
 * possibilities, so that was one rainbow-table lookup away from the PIN.
 * v2 salts and key-stretches it. SecureStore (OS keystore) is still the real
 * boundary; this makes the stored value worthless on its own.
 */

const CURRENT_VERSION = 2 as const;
const SALT_BYTES = 16;

/**
 * Key-stretching rounds.
 *
 * Each round is a JS↔native bridge call, so cost here is bridge latency rather
 * than CPU — 10,000 rounds would add seconds to every unlock. 1,000 is a
 * deliberate compromise; measure on a real device before raising it.
 */
const ITERATIONS = 1000;

interface StoredPinV2 {
  v: typeof CURRENT_VERSION;
  salt: string;
  hash: string;
  iterations: number;
  /** Epoch ms the verifier was cached, for TTL checks. */
  cachedAt: number;
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256 = (data: string): Promise<string> =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data, {
    encoding: Crypto.CryptoEncoding.HEX,
  });

/** v1 scheme, kept only so existing installs can be migrated on next unlock. */
const legacyHash = (pin: string): Promise<string> => sha256(pin);

const derive = async (
  pin: string,
  salt: string,
  iterations: number,
): Promise<string> => {
  let digest = await sha256(`${salt}:${pin}`);
  for (let i = 1; i < iterations; i += 1) {
    digest = await sha256(digest);
  }
  return digest;
};

/**
 * Length-independent comparison. Both operands are fixed-length hex digests of
 * our own making, so this is belt-and-braces rather than load-bearing.
 */
const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

const parseStored = (raw: string | null): StoredPinV2 | "v1" | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredPinV2>;
    if (
      parsed.v === CURRENT_VERSION &&
      typeof parsed.salt === "string" &&
      typeof parsed.hash === "string" &&
      typeof parsed.iterations === "number"
    ) {
      return {
        v: CURRENT_VERSION,
        salt: parsed.salt,
        hash: parsed.hash,
        iterations: parsed.iterations,
        cachedAt: typeof parsed.cachedAt === "number" ? parsed.cachedAt : 0,
      };
    }
    return null;
  } catch {
    // Not JSON — a v1 bare hex digest.
    return "v1";
  }
};

export async function savePin(pin: string): Promise<void> {
  const salt = toHex(await Crypto.getRandomBytesAsync(SALT_BYTES));
  const hash = await derive(pin, salt, ITERATIONS);
  const record: StoredPinV2 = {
    v: CURRENT_VERSION,
    salt,
    hash,
    iterations: ITERATIONS,
    cachedAt: Date.now(),
  };
  await secureStoreSetItem(PIN_HASH_KEY, JSON.stringify(record));
}

/**
 * Verify against the local cache. Returns false when nothing is cached —
 * callers must fall back to the server for that case, since it means this
 * device has not seen the PIN yet.
 */
export async function verifyPin(pin: string): Promise<boolean> {
  const raw = await secureStoreGetItem(PIN_HASH_KEY);
  const stored = parseStored(raw);
  if (!stored) return false;

  if (stored === "v1") {
    const matches = safeEqual(await legacyHash(pin), raw as string);
    // Transparently upgrade on the next successful unlock — no re-enrolment.
    if (matches) await savePin(pin);
    return matches;
  }

  const candidate = await derive(pin, stored.salt, stored.iterations);
  return safeEqual(candidate, stored.hash);
}

export async function clearPin(): Promise<void> {
  await secureStoreRemoveItem(PIN_HASH_KEY);
  await secureStoreRemoveItem(PIN_LOCKOUT_KEY);
}

export async function hasPinStored(): Promise<boolean> {
  return (await secureStoreGetItem(PIN_HASH_KEY)) !== null;
}

/**
 * True when a verifier is cached and still inside its TTL. A stale cache is
 * not deleted — the caller prefers the server but falls back to it when
 * offline, rather than locking the user out.
 */
export async function isPinCacheFresh(): Promise<boolean> {
  const stored = parseStored(await secureStoreGetItem(PIN_HASH_KEY));
  if (!stored) return false;
  // v1 records predate cachedAt; treat them as stale so they get refreshed.
  if (stored === "v1") return false;
  return Date.now() - stored.cachedAt < PIN_CACHE_TTL_MS;
}

/* ---------------------------------------------
   Lockout persistence

   Kept here so all SecureStore access lives in one module; the policy itself
   is pure and lives in lib/pinLockout.ts.
----------------------------------------------*/

export async function readLockout(): Promise<PinLockoutState> {
  try {
    return parseLockout(await secureStoreGetItem(PIN_LOCKOUT_KEY));
  } catch {
    return initialLockoutState();
  }
}

export async function writeLockout(state: PinLockoutState): Promise<void> {
  await secureStoreSetItem(PIN_LOCKOUT_KEY, serializeLockout(state));
}
