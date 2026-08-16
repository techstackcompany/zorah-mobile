import { HeaderBack } from "@/components/ui/HeaderBack";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import React from "react";

// Setup steps are a guided flow — no going back mid-flow.

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
        headerLeft: () => <HeaderBack />,
      }}
    >
      <Stack.Screen name="financial-goals" />
      <Stack.Screen name="monthly-income" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="your-banks" />
    </Stack>
  );
};

export default Layout;
