import Overlay from "@/components/ui/Overlay";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import LockScreen from "@/screens/LockScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, StyleSheet, View } from "react-native";

const LAST_BACKGROUND_KEY = "userInactivity:wasInBackground";
const LAST_ACTIVE_KEY = "userInactivity:lastActive";
const INACTIVITY_LOCK_TIMEOUT_MS = 60000; 
const BACKGROUND_LOCK_TIMEOUT_MS = 5000;

const UserInactivityProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const wasInBackground = useRef<boolean>(false);
  const lastActiveAt = useRef<number | null>(null);
  const [isLockVisible, setIsLockVisible] = useState(false);
  const [showPrivacyOverlay, setShowPrivacyOverlay] = useState(false);
  const { settings } = useAppSettings();
  const inactivityTimeout = INACTIVITY_LOCK_TIMEOUT_MS;

  const persistState = useCallback((entries: [string, string][]) => {
    void AsyncStorage.multiSet(entries);
  }, []);

  const markActive = useCallback(() => {
    if (isLockVisible || appState.current !== "active") return;

    const now = Date.now();
    lastActiveAt.current = now;
    AsyncStorage.setItem(LAST_ACTIVE_KEY, now.toString());
  }, [isLockVisible]);

  const hideLock = useCallback(() => {
    setIsLockVisible(false);
    const now = Date.now();
    persistState([
      [LAST_BACKGROUND_KEY, "false"],
      [LAST_ACTIVE_KEY, now.toString()],
    ]);
    lastActiveAt.current = now;
    setShowPrivacyOverlay(false);
  }, [persistState]);

  const triggerLock = useCallback(() => {
    if (!settings.enableBiometrics) {
      return;
    }
    setIsLockVisible(true);
  }, [settings.enableBiometrics]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const previousState = appState.current;

      if (
        (nextAppState === "background" || nextAppState === "inactive") &&
        previousState === "active"
      ) {
        wasInBackground.current = true;
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
          hideLock();
        }

        setShowPrivacyOverlay(false);
      }

      appState.current = nextAppState;
    },
    [
      hideLock,
      settings.enableBiometrics,
      settings.privacyOverlayEnabled,
      triggerLock,
      persistState,
    ],
  );

  useEffect(() => {
    const loadState = async () => {
      try {
        const [storedBackground, storedLastActive] = await AsyncStorage.multiGet(
          [LAST_BACKGROUND_KEY, LAST_ACTIVE_KEY],
        );
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
        }
      } catch (error) {
        console.error("Failed to load background state", error);
      }
    };
    loadState();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [
    handleAppStateChange,
    settings.enableBiometrics,
    triggerLock,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !settings.enableBiometrics ||
        isLockVisible ||
        appState.current !== "active" ||
        lastActiveAt.current === null
      ) {
        return;
      }

      const shouldLock =
        Date.now() - lastActiveAt.current >= inactivityTimeout;

      if (shouldLock) {
        wasInBackground.current = true;
        triggerLock();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLockVisible, inactivityTimeout, settings.enableBiometrics, triggerLock]);

  useEffect(() => {
    if (!settings.enableBiometrics && isLockVisible) {
      setIsLockVisible(false);
      setShowPrivacyOverlay(false);
    }
  }, [isLockVisible, settings.enableBiometrics]);

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

      <LockScreen
        visible={isLockVisible}
        onUnlock={hideLock}
        variant="modal"
      />
    </View>
  );
};

export default UserInactivityProvider;
