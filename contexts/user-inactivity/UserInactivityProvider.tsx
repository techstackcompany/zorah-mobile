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

      if (
        (nextAppState === "background" || nextAppState === "inactive") &&
        previousState === "active"
      ) {
        wasInBackground.current = true;
        void AsyncStorage.setItem(LAST_BACKGROUND_KEY, "true");

        if (settings.enableBiometrics) {
          router.push("/(app)/biometrics/overlay");
        }
      }

      if (
        nextAppState === "active" &&
        (previousState === "background" || previousState === "inactive")
      ) {
        if (settings.enableBiometrics && wasInBackground.current) {
          wasInBackground.current = false;
          void AsyncStorage.setItem(LAST_BACKGROUND_KEY, "false");

          router.replace("/(app)/biometrics/lock");
        } else {
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
