/**
 * Brute-force policy for the offline PIN.
 *
 * Verification used to round-trip to the server, which rate-limited it for us.
 * Now that it is entirely local, nothing stops someone holding the device from
 * walking the whole PIN space through the keypad. This module is that limit.
 *
 * Deliberately pure — no SecureStore, no expo-crypto, no React — so it can be
 * unit tested under the node jest environment. Persistence lives in
 * lib/pinStorage.ts.
 */

export interface PinLockoutState {
  failedAttempts: number;
  /** Epoch ms until which entry is blocked, or null when not locked out. */
  lockedUntil: number | null;
}

/** Failures allowed before the first cooldown kicks in. */
export const PIN_FREE_ATTEMPTS = 5;

/** Cooldown applied at the 5th, 6th, 7th and 8th-or-later failure. */
export const PIN_COOLDOWN_SCHEDULE_MS = [
  30_000, // 30s
  120_000, // 2m
  600_000, // 10m
  1_800_000, // 30m
];

export const initialLockoutState = (): PinLockoutState => ({
  failedAttempts: 0,
  lockedUntil: null,
});

export const isLockedOut = (state: PinLockoutState, now: number): boolean =>
  state.lockedUntil !== null && state.lockedUntil > now;

export const cooldownRemainingMs = (
  state: PinLockoutState,
  now: number,
): number => (isLockedOut(state, now) ? state.lockedUntil! - now : 0);

/** Attempts left before the next cooldown. Zero once one is in force. */
export const attemptsRemaining = (state: PinLockoutState): number =>
  Math.max(0, PIN_FREE_ATTEMPTS - state.failedAttempts);

export const recordFailure = (
  state: PinLockoutState,
  now: number,
): PinLockoutState => {
  const failedAttempts = state.failedAttempts + 1;

  if (failedAttempts < PIN_FREE_ATTEMPTS) {
    return { failedAttempts, lockedUntil: null };
  }

  // 5th failure takes the first cooldown; each further failure escalates, and
  // the longest one repeats indefinitely after that.
  const index = Math.min(
    failedAttempts - PIN_FREE_ATTEMPTS,
    PIN_COOLDOWN_SCHEDULE_MS.length - 1,
  );

  return { failedAttempts, lockedUntil: now + PIN_COOLDOWN_SCHEDULE_MS[index] };
};

/** Called on any successful unlock, including biometric. */
export const reset = (): PinLockoutState => initialLockoutState();

/* ---------------------------------------------
   Serialization — the state is persisted so that force-quitting the app does
   not wipe a cooldown. Parsing is tolerant: anything unreadable is treated as
   a clean slate rather than throwing on the unlock path.
----------------------------------------------*/

export const serializeLockout = (state: PinLockoutState): string =>
  JSON.stringify(state);

export const parseLockout = (raw: string | null): PinLockoutState => {
  if (!raw) return initialLockoutState();
  try {
    const parsed = JSON.parse(raw) as Partial<PinLockoutState>;
    const failedAttempts =
      typeof parsed.failedAttempts === "number" && parsed.failedAttempts >= 0
        ? parsed.failedAttempts
        : 0;
    const lockedUntil =
      typeof parsed.lockedUntil === "number" ? parsed.lockedUntil : null;
    return { failedAttempts, lockedUntil };
  } catch {
    return initialLockoutState();
  }
};
