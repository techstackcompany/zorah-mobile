import Overlay from "@/components/ui/Overlay";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import LockScreen from "@/screens/LockScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, StyleSheet, View } from "react-native";

const LAST_BACKGROUND_KEY = "userInactivity:wasInBackground";
const LAST_ACTIVE_KEY = "userInactivity:lastActive";
const INACTIVITY_LOCK_TIMEOUT_MS = 60_000 * 5; 
const BACKGROUND_LOCK_TIMEOUT_MS = 30_000; 

const UserInactivityProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const wasInBackground = useRef<boolean>(false);
  const lastActiveAt = useRef<number | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLockVisible, setIsLockVisible] = useState(false);
  const [showPrivacyOverlay, setShowPrivacyOverlay] = useState(false);
  const { settings, isLoaded: settingsLoaded } = useAppSettings();

  const persistState = useCallback((entries: [string, string][]) => {
    void AsyncStorage.multiSet(entries);
  }, []);

  const cancelInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const triggerLock = useCallback(() => {
    if (!settings.enableBiometrics) return;
    cancelInactivityTimer();
    setIsLockVisible(true);
  }, [settings.enableBiometrics, cancelInactivityTimer]);

  // Cancels any previous timeout and schedules a new one. Called on every
  // user touch, after unlock, and on foreground return when not locking.
  const scheduleInactivityTimer = useCallback(() => {
    cancelInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      triggerLock();
    }, INACTIVITY_LOCK_TIMEOUT_MS);
  }, [cancelInactivityTimer, triggerLock]);

  const hideLock = useCallback(() => {
    setIsLockVisible(false);
    const now = Date.now();
    persistState([
      [LAST_BACKGROUND_KEY, "false"],
      [LAST_ACTIVE_KEY, now.toString()],
    ]);
    lastActiveAt.current = now;
    setShowPrivacyOverlay(false);
    scheduleInactivityTimer();
  }, [persistState, scheduleInactivityTimer]);

  // Called on every user touch via the View responder wrapper below.
  const markActive = useCallback(() => {
    if (isLockVisible || appState.current !== "active") return;
    const now = Date.now();
    lastActiveAt.current = now;
    AsyncStorage.setItem(LAST_ACTIVE_KEY, now.toString());
    scheduleInactivityTimer();
  }, [isLockVisible, scheduleInactivityTimer]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const previousState = appState.current;

      if (
        (nextAppState === "background" || nextAppState === "inactive") &&
        previousState === "active"
      ) {
        wasInBackground.current = true;
        cancelInactivityTimer();
        const now = Date.now();
        lastActiveAt.current = now;
        persistState([
          [LAST_BACKGROUND_KEY, "true"],
          [LAST_ACTIVE_KEY, now.toString()],
        ]);
        if (settings.enableBiometrics && settings.privacyOverlayEnabled) {
          setShowPrivacyOverlay(true);
        }
      }

      if (
        nextAppState === "active" &&
        (previousState === "background" || previousState === "inactive")
      ) {
        setShowPrivacyOverlay(false);
        if (settings.enableBiometrics && wasInBackground.current) {
          wasInBackground.current = false;
          const lastActiveTime = lastActiveAt.current ?? Date.now();
          const shouldLock =
            Date.now() - lastActiveTime >= BACKGROUND_LOCK_TIMEOUT_MS;
          if (shouldLock) {
            triggerLock();
          } else {
            hideLock();
          }
        } else {
          wasInBackground.current = false;
          scheduleInactivityTimer();
        }
      }

      appState.current = nextAppState;
    },
    [
      hideLock,
      settings.enableBiometrics,
      settings.privacyOverlayEnabled,
      triggerLock,
      persistState,
      cancelInactivityTimer,
      scheduleInactivityTimer,
    ],
  );

  // Register AppState listener. Separate from the cold-start check so that
  // the listener is not re-registered when settingsLoaded changes.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [handleAppStateChange]);

  // Cold-start lock check. Waits for settings to load from AsyncStorage before
  // making any decision so the default false value never silently skips a lock.
  useEffect(() => {
    if (!settingsLoaded) return;

    const checkInitialLockState = async () => {
      try {
        const [storedBackground, storedLastActive] =
          await AsyncStorage.multiGet([LAST_BACKGROUND_KEY, LAST_ACTIVE_KEY]);
        const wasBg = storedBackground?.[1] === "true";
        const lastActive = Number(storedLastActive?.[1] ?? "");
        lastActiveAt.current = Number.isFinite(lastActive)
          ? lastActive
          : Date.now();

        if (
          settings.enableBiometrics &&
          wasBg &&
          Date.now() - (lastActiveAt.current ?? Date.now()) >=
            BACKGROUND_LOCK_TIMEOUT_MS
        ) {
          triggerLock();
        } else {
          scheduleInactivityTimer();
        }
      } catch (error) {
        console.error("Failed to load background state", error);
        scheduleInactivityTimer();
      }
    };
    checkInitialLockState();
  }, [
    settingsLoaded,
    settings.enableBiometrics,
    triggerLock,
    scheduleInactivityTimer,
  ]);

  // Auto-dismiss lock if biometrics is disabled while lock is visible.
  useEffect(() => {
    if (!settings.enableBiometrics && isLockVisible) {
      setIsLockVisible(false);
      setShowPrivacyOverlay(false);
    }
  }, [isLockVisible, settings.enableBiometrics]);

  // Cancel timer on unmount to prevent memory leaks.
  useEffect(() => {
    return () => cancelInactivityTimer();
  }, [cancelInactivityTimer]);

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        markActive();
        return false;
      }}
      onTouchEndCapture={markActive}
    >
      {children}

      {showPrivacyOverlay ? (
        <View style={StyleSheet.absoluteFill}>
          <Overlay />
        </View>
      ) : null}

      <LockScreen visible={isLockVisible} onUnlock={hideLock} variant="modal" />
    </View>
  );
};

export default UserInactivityProvider;
