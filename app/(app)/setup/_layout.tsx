import { Image } from "expo-image";
import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerRight: () => null,
        headerTitleAlign: "left",
        headerTitle: () => (
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 100, aspectRatio: 997 / 250 }}
          />
        ),
      }}
    >
    
      <Stack.Screen
        name="monthly-income"
        options={{ headerLeft: () => null, headerBackVisible: false }}
      />
      <Stack.Screen
        name="your-banks"
        options={{ headerLeft: () => null, headerBackVisible: false }}
      />
      <Stack.Screen
        name="summary"
        options={{ headerLeft: () => null, headerBackVisible: false }}
      />
      <Stack.Screen
        name="biometric-setup"
        options={{ headerLeft: () => null, headerBackVisible: false }}
      />
    </Stack>
  );
};

export default Layout;
