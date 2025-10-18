import { Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup"  />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
};

export default AuthLayout;
