import { useSession } from "@/contexts/auth-context/useSession";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

const AuthLayout = () => {
  const { hasOnboarded } = useSession();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasOnboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Screen name="signIn" />
      <Stack.Screen name="signUp" />
    </Stack>
  );
};

export default AuthLayout;
