import { useSession } from "@/contexts/auth-context/useSession";
import { Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  const { hasOnboarded } = useSession();
  console.log("hasOnboarded", hasOnboarded);
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
