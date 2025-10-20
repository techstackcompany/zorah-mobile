import { Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="setup"  />
      <Stack.Screen name="signUp" />
    </Stack>
  );
};

export default AuthLayout;
