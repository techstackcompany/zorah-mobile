import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const LOCK_TIME = 3000;
const LAST_BACKGROUND_KEY = "userInactivity:lastBackgroundTime";

const UserInactivityProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const startTime = useRef<number | null>(null);
  const router = useRouter();

  const loadPersistedStartTime = async () => {
    try {
      const stored = await AsyncStorage.getItem(LAST_BACKGROUND_KEY);
      if (stored) {
        startTime.current = Number(stored);
      }
    } catch (error) {
      console.error("Failed to load persisted inactivity time", error);
    }
  };

  useEffect(() => {
    loadPersistedStartTime();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log("appState", appState.current, nextAppState);
    console.log("nextAppState", nextAppState);
    if (nextAppState === "inactive") {
      console.log("background");
      router.push("/(app)/biometrics/overlay");
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }
    if (nextAppState === "background") {
      
      void recordStartTime();
    } else if (
      nextAppState === "active" &&
      appState.current === "background"
    ) {
      if (startTime.current && Date.now() - startTime.current > LOCK_TIME) {
        router.push("/(app)/biometrics/lock");
      }
    }
    appState.current = nextAppState;
  };

  const recordStartTime = async () => {
    try {
      const timestamp = Date.now();
      startTime.current = timestamp;
      await AsyncStorage.setItem(
        LAST_BACKGROUND_KEY,
        timestamp.toString(),
      );
    } catch (error) {
      console.error("Failed to persist inactivity time", error);
    }
  };

  return <>{children}</>;
};

export default UserInactivityProvider;
