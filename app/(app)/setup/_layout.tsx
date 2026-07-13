import { HeaderBack } from "@/components/ui/HeaderBack";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import React from "react";

// Setup steps are a guided flow — no going back mid-flow.
const noBack = {
  headerBackVisible: false,
  headerLeft: () => null,
};

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
      <Stack.Screen name="financial-goals" options={noBack} />
      <Stack.Screen name="monthly-income" options={noBack} />
      <Stack.Screen name="kyc" options={noBack} />
      <Stack.Screen name="your-banks" options={noBack} />
    </Stack>
  );
};

export default Layout;
