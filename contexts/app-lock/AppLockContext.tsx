import { useSession } from "@/contexts/auth-context/useSession";
import { useBiometricSupport } from "@/hooks/useBiometricSupport";
import {
  hasPinStored,
  savePin,
  verifyPin as verifyLocalPin,
} from "@/lib/pinStorage";
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

const INACTIVITY_TIMEOUT_MS = 1 * 1000 * 60; // 5 minutes

export type AppLockContextValue = {
  isLocked: boolean;
  isBiometricAvailable: boolean;
  isInitializing: boolean;
  lock: () => void;
  unlock: () => void;
  markActive: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  authenticateWithBiometric: () => Promise<void>;
  forgotPin: () => void;
};

export const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: PropsWithChildren) {
  const { signOut, isLoading } = useSession();
  const { data: profile } = useGetUserProfileQuery();
  const { isAvailable: isBiometricAvailable } = useBiometricSupport();
  const { mutateAsync: verifyPinOnServer } = useVerifyUserPinMutation();

  const [isLocked, setIsLocked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const hasDoneInitialCheck = useRef(false);
  const isLockedRef = useRef(false);
  const biometricEnabledRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    const syncCanLock = async () => {
      const biometricEnabled = profile?.biometricEnabled ?? false;
      console.log("biometricEnabled", biometricEnabled);
      if (!biometricEnabled) {
        biometricEnabledRef.current = false;
        return;
      }
      biometricEnabledRef.current = await hasPinStored();
      console.log(
        "biometricEnabledRef.current pin",
        biometricEnabledRef.current,
      );
    };
    syncCanLock();
  }, [profile?.biometricEnabled]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const lock = useCallback(() => {
    if (!biometricEnabledRef.current) return;
    clearInactivityTimer();
    setIsLocked(true);
    isLockedRef.current = true;
  }, [clearInactivityTimer]);

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    if (!biometricEnabledRef.current) return;
    console.log("Setting inactivity timer");
    inactivityTimerRef.current = setTimeout(lock, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, lock]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    isLockedRef.current = false;
    startInactivityTimer();
  }, [startInactivityTimer]);

  const markActive = useCallback(() => {
    console.log("isLockedRef.current", isLockedRef.current);
    if (!isLockedRef.current) {
      startInactivityTimer();
    }
  }, [startInactivityTimer]);

  useEffect(() => {
    if (isLoading || hasDoneInitialCheck.current) return;
    hasDoneInitialCheck.current = true;
    const init = async () => {
      const biometricEnabled = profile?.biometricEnabled ?? false;
      const canLock = biometricEnabled && (await hasPinStored());
      biometricEnabledRef.current = canLock;
      if (canLock) {
        setIsLocked(true);
        isLockedRef.current = true;
      }
      setIsInitializing(false);
    };
    init();
  }, [isLoading, profile]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        if (biometricEnabledRef.current) {
          clearInactivityTimer();
          setIsLocked(true);
          isLockedRef.current = true;
        }
      }
    });
    return () => sub.remove();
  }, [clearInactivityTimer]);

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const hasLocal = await hasPinStored();
      if (hasLocal) {
        const success = await verifyLocalPin(pin);
        if (success) unlock();
        return success;
      }
      try {
        await verifyPinOnServer({ pin });
        await savePin(pin);
        return true;
      } catch {
        return false;
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
      if (result.success) unlock();
    } catch {}
  }, [unlock]);

  const forgotPin = useCallback(() => {
    setIsLocked(false);
    isLockedRef.current = false;
    signOut();
  }, [signOut]);

  const value = useMemo<AppLockContextValue>(
    () => ({
      isLocked,
      isBiometricAvailable,
      isInitializing,
      lock,
      unlock,
      markActive,
      verifyPin,
      authenticateWithBiometric,
      forgotPin,
    }),
    [
      isLocked,
      isBiometricAvailable,
      isInitializing,
      lock,
      unlock,
      markActive,
      verifyPin,
      authenticateWithBiometric,
      forgotPin,
    ],
  );

  return (
    <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>
  );
}
