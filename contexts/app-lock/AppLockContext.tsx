import { useSession } from "@/contexts/auth-context/useSession";
import { useBiometricSupport } from "@/hooks/useBiometricSupport";
import {
  attemptsRemaining as lockoutAttemptsRemaining,
  cooldownRemainingMs,
  isLockedOut,
  recordFailure,
  reset as resetLockout,
} from "@/lib/pinLockout";
import {
  clearPin,
  hasPinStored,
  isPinCacheFresh,
  readLockout,
  savePin,
  verifyPin as verifyLocalPin,
  writeLockout,
} from "@/lib/pinStorage";
import type { ApiError } from "@/src/api/client";
import {
  useGetUserProfileQuery,
  useVerifyUserPinMutation,
} from "@/src/api/hooks";
import * as LocalAuthentication from "expo-local-authentication";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

/**
 * Foreground idle before locking. Any touch resets it (see markActive), so this
 * only fires when the screen is genuinely untouched. Backgrounding the app
 * locks it separately and immediately, which is the stronger control — 60s here
 * added friction without adding much protection.
 */
const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * Why a PIN entry failed, so the lock screen can say something useful instead
 * of shaking for every case.
 */
export type PinVerifyResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; attemptsRemaining: number }
  | { ok: false; reason: "locked_out"; retryInMs: number }
  /** This device has never cached the PIN and there is no connection to check. */
  | { ok: false; reason: "needs_connection" };

export type AppLockContextValue = {
  isLocked: boolean;
  isBiometricAvailable: boolean;
  isInitializing: boolean;
  needsPinSetup: boolean;
  lock: () => void;
  unlock: () => void;
  markActive: () => void;
  verifyPin: (pin: string) => Promise<PinVerifyResult>;
  authenticateWithBiometric: () => Promise<void>;
  /** Sign out — the escape hatch when the account password is also forgotten. */
  forgotPin: () => void;
  /**
   * Open a window in which the app will not re-lock, so a user who has just
   * proved ownership with their password can reach PIN setup. Without this the
   * 60s inactivity timer (or backgrounding the app) would lock them straight
   * back out with the PIN they already said they had forgotten.
   */
  beginPinReset: () => void;
  endPinReset: () => void;
  syncLockState: () => Promise<void>;
};

export const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: PropsWithChildren) {
  const { signOut, isLoading, isAuthenticated } = useSession();
  const { data: profile, isLoading: isProfileLoading } =
    useGetUserProfileQuery();
  const { isAvailable: isBiometricAvailable } = useBiometricSupport();
  const { mutateAsync: verifyPinOnServer } = useVerifyUserPinMutation();

  const [isLocked, setIsLocked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);

  const hasDoneInitialCheck = useRef(false);
  const isLockedRef = useRef(false);
  const biometricEnabledRef = useRef(false);
  const isResettingPinRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // The app can lock whenever the account has a PIN — even on a device that
  // has not cached it yet, because the lock screen can restore it from the
  // server. Gating on local storage was what sent returning users to "Set Up
  // PIN" instead of asking them to enter the PIN they already had.
  const canLock =
    (profile?.biometricEnabled ?? false) && (profile?.isPinSet ?? false);

  useEffect(() => {
    biometricEnabledRef.current = canLock;
  }, [canLock]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const lock = useCallback(() => {
    if (!biometricEnabledRef.current) return;
    // Mid PIN reset the user has proved ownership with their password but has
    // no PIN they can enter yet — locking now would strand them.
    if (isResettingPinRef.current) return;
    clearInactivityTimer();
    setIsLocked(true);
    isLockedRef.current = true;
  }, [clearInactivityTimer]);

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    if (!biometricEnabledRef.current) return;
    inactivityTimerRef.current = setTimeout(lock, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, lock]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    isLockedRef.current = false;
    startInactivityTimer();
  }, [startInactivityTimer]);

  const markActive = useCallback(() => {
    if (!isLockedRef.current) {
      startInactivityTimer();
    }
  }, [startInactivityTimer]);

  useEffect(() => {
    if (isLoading || isProfileLoading || hasDoneInitialCheck.current) return;
    hasDoneInitialCheck.current = true;
    biometricEnabledRef.current = canLock;
    // Only when the *account* has no PIN. A device that simply has not cached
    // one yet gets the lock screen, which restores it from the server.
    setNeedsPinSetup(
      (profile?.biometricEnabled ?? false) && !(profile?.isPinSet ?? false),
    );
    if (canLock) {
      setIsLocked(true);
      isLockedRef.current = true;
    }
    setIsInitializing(false);
  }, [isLoading, isProfileLoading, profile, canLock]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      // Only a real background means the user left the app. On iOS "inactive"
      // is transient — it fires for system permission dialogs, Face ID
      // prompts, Control Centre and the app-switcher peek, all of which return
      // straight to "active". Locking on it interrupted voice expense logging
      // the moment it asked for the microphone.
      if (nextState !== "background") return;
      if (biometricEnabledRef.current && !isResettingPinRef.current) {
        clearInactivityTimer();
        setIsLocked(true);
        isLockedRef.current = true;
      }
    });
    return () => sub.remove();
  }, [clearInactivityTimer]);

  /**
   * The server owns the PIN so it can follow the user between devices; the
   * local record is an offline cache of a verifier.
   *
   *   cache present & fresh  -> check locally (fast, works offline)
   *   no cache / stale       -> ask the server, then cache the result
   *   no cache & offline     -> cannot decide; tell the user to connect
   */
  const verifyPin = useCallback(
    async (pin: string): Promise<PinVerifyResult> => {
      const lockout = await readLockout();
      const now = Date.now();
      if (isLockedOut(lockout, now)) {
        return {
          ok: false,
          reason: "locked_out",
          retryInMs: cooldownRemainingMs(lockout, now),
        };
      }

      const onFailure = async (): Promise<PinVerifyResult> => {
        const next = recordFailure(lockout, Date.now());
        await writeLockout(next);
        return isLockedOut(next, Date.now())
          ? {
              ok: false,
              reason: "locked_out",
              retryInMs: cooldownRemainingMs(next, Date.now()),
            }
          : {
              ok: false,
              reason: "invalid",
              attemptsRemaining: lockoutAttemptsRemaining(next),
            };
      };

      const onSuccess = async (): Promise<PinVerifyResult> => {
        await writeLockout(resetLockout());
        unlock();
        return { ok: true };
      };

      const [hasLocal, isFresh] = await Promise.all([
        hasPinStored(),
        isPinCacheFresh(),
      ]);

      if (hasLocal && isFresh) {
        return (await verifyLocalPin(pin)) ? onSuccess() : onFailure();
      }

      try {
        await verifyPinOnServer({ pin });
        // Cache it so subsequent unlocks work offline. This is also the
        // new-device restore path.
        await savePin(pin);
        return onSuccess();
      } catch (error) {
        // handleApiError only sets `status` from a real response, so its
        // absence means the request never reached the server.
        const isOffline = !(error as ApiError)?.status;

        if (isOffline && hasLocal) {
          // Cache is stale but it is all we have — better than locking the
          // user out of their own app because they have no signal.
          return (await verifyLocalPin(pin)) ? onSuccess() : onFailure();
        }
        if (isOffline) {
          return { ok: false, reason: "needs_connection" };
        }
        return onFailure();
      }
    },
    [unlock, verifyPinOnServer],
  );

  const authenticateWithBiometric = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Zorah",
        cancelLabel: "Use PIN",
        disableDeviceFallback: true,
      });
      if (result.success) {
        // A successful unlock by any means clears the PIN cooldown.
        await writeLockout(resetLockout());
        unlock();
      }
    } catch {}
  }, [unlock]);

  const forgotPin = useCallback(() => {
    setIsLocked(false);
    isLockedRef.current = false;
    isResettingPinRef.current = false;
    void clearPin();
    signOut();
  }, [signOut]);

  const beginPinReset = useCallback(() => {
    isResettingPinRef.current = true;
    // The cached verifier is for the PIN they cannot remember. Drop it so the
    // stale value cannot satisfy a later unlock, and clear any cooldown earned
    // while guessing.
    void clearPin();
    clearInactivityTimer();
    setIsLocked(false);
    isLockedRef.current = false;
  }, [clearInactivityTimer]);

  const endPinReset = useCallback(() => {
    isResettingPinRef.current = false;
    startInactivityTimer();
  }, [startInactivityTimer]);

  const syncLockState = useCallback(async () => {
    const biometricEnabled = profile?.biometricEnabled ?? false;
    if (!biometricEnabled) {
      biometricEnabledRef.current = false;
      setNeedsPinSetup(false);
      return;
    }
    // Callers invoke this right after setting a PIN, before the profile
    // refetch has landed, so trust the freshly written local cache as well as
    // the (possibly stale) `isPinSet` flag.
    const hasPin = (profile?.isPinSet ?? false) || (await hasPinStored());
    biometricEnabledRef.current = hasPin;
    setNeedsPinSetup(!hasPin);
  }, [profile?.biometricEnabled, profile?.isPinSet]);

  const value = useMemo<AppLockContextValue>(
    () => ({
      isLocked: isLocked && isAuthenticated,
      isBiometricAvailable,
      isInitializing,
      needsPinSetup,
      lock,
      unlock,
      markActive,
      verifyPin,
      authenticateWithBiometric,
      forgotPin,
      beginPinReset,
      endPinReset,
      syncLockState,
    }),
    [
      isLocked,
      isAuthenticated,
      isBiometricAvailable,
      isInitializing,
      needsPinSetup,
      lock,
      unlock,
      markActive,
      verifyPin,
      authenticateWithBiometric,
      forgotPin,
      beginPinReset,
      endPinReset,
      syncLockState,
    ],
  );

  return (
    <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>
  );
}
