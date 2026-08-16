import {
  PIN_COOLDOWN_SCHEDULE_MS,
  PIN_FREE_ATTEMPTS,
  attemptsRemaining,
  cooldownRemainingMs,
  initialLockoutState,
  isLockedOut,
  parseLockout,
  recordFailure,
  reset,
  serializeLockout,
} from "./pinLockout";

const NOW = 1_700_000_000_000;

/** Apply `count` consecutive failures, all at the same instant. */
const failTimes = (count: number, now = NOW) => {
  let state = initialLockoutState();
  for (let i = 0; i < count; i += 1) state = recordFailure(state, now);
  return state;
};

describe("recordFailure", () => {
  it("does not lock out before the free attempts are used up", () => {
    for (let n = 1; n < PIN_FREE_ATTEMPTS; n += 1) {
      const state = failTimes(n);
      expect(state.lockedUntil).toBeNull();
      expect(isLockedOut(state, NOW)).toBe(false);
    }
  });

  it("locks out on the fifth failure with the first cooldown", () => {
    const state = failTimes(PIN_FREE_ATTEMPTS);
    expect(isLockedOut(state, NOW)).toBe(true);
    expect(state.lockedUntil).toBe(NOW + PIN_COOLDOWN_SCHEDULE_MS[0]);
  });

  it("escalates through the schedule on each further failure", () => {
    PIN_COOLDOWN_SCHEDULE_MS.forEach((expected, index) => {
      const state = failTimes(PIN_FREE_ATTEMPTS + index);
      expect(state.lockedUntil).toBe(NOW + expected);
    });
  });

  it("repeats the longest cooldown once the schedule is exhausted", () => {
    const longest = PIN_COOLDOWN_SCHEDULE_MS[PIN_COOLDOWN_SCHEDULE_MS.length - 1];
    const past = failTimes(PIN_FREE_ATTEMPTS + PIN_COOLDOWN_SCHEDULE_MS.length + 5);
    expect(past.lockedUntil).toBe(NOW + longest);
  });
});

describe("isLockedOut / cooldownRemainingMs", () => {
  it("expires once the cooldown elapses", () => {
    const state = failTimes(PIN_FREE_ATTEMPTS);
    const cooldown = PIN_COOLDOWN_SCHEDULE_MS[0];

    expect(isLockedOut(state, NOW + cooldown - 1)).toBe(true);
    expect(isLockedOut(state, NOW + cooldown)).toBe(false);
    expect(isLockedOut(state, NOW + cooldown + 1)).toBe(false);
  });

  it("counts down while locked and reports zero afterwards", () => {
    const state = failTimes(PIN_FREE_ATTEMPTS);
    const cooldown = PIN_COOLDOWN_SCHEDULE_MS[0];

    expect(cooldownRemainingMs(state, NOW)).toBe(cooldown);
    expect(cooldownRemainingMs(state, NOW + 10_000)).toBe(cooldown - 10_000);
    expect(cooldownRemainingMs(state, NOW + cooldown)).toBe(0);
  });

  it("reports not-locked-out for a clean slate", () => {
    expect(isLockedOut(initialLockoutState(), NOW)).toBe(false);
    expect(cooldownRemainingMs(initialLockoutState(), NOW)).toBe(0);
  });
});

describe("attemptsRemaining", () => {
  it("counts down from the free allowance", () => {
    expect(attemptsRemaining(initialLockoutState())).toBe(PIN_FREE_ATTEMPTS);
    expect(attemptsRemaining(failTimes(1))).toBe(PIN_FREE_ATTEMPTS - 1);
    expect(attemptsRemaining(failTimes(PIN_FREE_ATTEMPTS - 1))).toBe(1);
  });

  it("never goes negative once locked out", () => {
    expect(attemptsRemaining(failTimes(PIN_FREE_ATTEMPTS))).toBe(0);
    expect(attemptsRemaining(failTimes(PIN_FREE_ATTEMPTS + 10))).toBe(0);
  });
});

describe("reset", () => {
  it("clears both the counter and an active cooldown", () => {
    expect(failTimes(PIN_FREE_ATTEMPTS + 2).failedAttempts).toBeGreaterThan(0);
    expect(reset()).toEqual({ failedAttempts: 0, lockedUntil: null });
    expect(isLockedOut(reset(), NOW)).toBe(false);
  });
});

describe("persistence", () => {
  it("survives a round trip, so force-quitting does not clear a cooldown", () => {
    const state = failTimes(PIN_FREE_ATTEMPTS);
    const restored = parseLockout(serializeLockout(state));

    expect(restored).toEqual(state);
    expect(isLockedOut(restored, NOW)).toBe(true);
    expect(cooldownRemainingMs(restored, NOW)).toBe(PIN_COOLDOWN_SCHEDULE_MS[0]);
  });

  it("treats missing or corrupt storage as a clean slate rather than throwing", () => {
    expect(parseLockout(null)).toEqual(initialLockoutState());
    expect(parseLockout("")).toEqual(initialLockoutState());
    expect(parseLockout("not json")).toEqual(initialLockoutState());
    expect(parseLockout("{")).toEqual(initialLockoutState());
  });

  it("ignores nonsense field types", () => {
    expect(parseLockout('{"failedAttempts":"nope","lockedUntil":"nope"}')).toEqual(
      initialLockoutState(),
    );
    expect(parseLockout('{"failedAttempts":-5}')).toEqual(initialLockoutState());
  });
});
