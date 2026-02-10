import { Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  console.log("AuthLayout");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signIn" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="signUp" />
    </Stack>
  );
};

export default AuthLayout;
