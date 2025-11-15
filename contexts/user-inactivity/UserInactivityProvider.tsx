import useAppSettings from "@/contexts/settings-context/useAppSettings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { FC, useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const LAST_BACKGROUND_KEY = "userInactivity:wasInBackground";

const UserInactivityProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const wasInBackground = useRef<boolean>(false);
  const router = useRouter();
  const { settings } = useAppSettings();

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const previousState = appState.current;

      // When app goes to background or inactive
      if (
        (nextAppState === "background" || nextAppState === "inactive") &&
        previousState === "active"
      ) {
        // Mark that app was in background
        wasInBackground.current = true;
        void AsyncStorage.setItem(LAST_BACKGROUND_KEY, "true");

        // Show overlay immediately when going to background
        if (settings.enableBiometrics) {
          router.push("/(app)/biometrics/overlay");
        }
      }

      // When app comes back to active from background
      if (
        nextAppState === "active" &&
        (previousState === "background" || previousState === "inactive")
      ) {
        // Always show lock screen if biometrics are enabled and app was in background
        if (settings.enableBiometrics && wasInBackground.current) {
          // Clear the background flag
          wasInBackground.current = false;
          void AsyncStorage.setItem(LAST_BACKGROUND_KEY, "false");

          // Navigate to lock screen - use replace to prevent going back
          router.replace("/(app)/biometrics/lock");
        } else {
          // Clear the background flag even if biometrics are disabled
          wasInBackground.current = false;
          void AsyncStorage.setItem(LAST_BACKGROUND_KEY, "false");
        }
      }

      appState.current = nextAppState;
    },
    [settings.enableBiometrics, router],
  );

  useEffect(() => {
    const loadBackgroundState = async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_BACKGROUND_KEY);
        if (stored === "true") {
          wasInBackground.current = true;
          // If app was in background and biometrics are enabled, show lock immediately
          if (settings.enableBiometrics) {
            router.replace("/(app)/biometrics/lock");
          }
        }
      } catch (error) {
        console.error("Failed to load background state", error);
      }
    };
    loadBackgroundState();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [settings.enableBiometrics, handleAppStateChange, router]);

  return <>{children}</>;
};

export default UserInactivityProvider;
