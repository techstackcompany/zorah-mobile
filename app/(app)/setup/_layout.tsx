import COLORS from "@/constants/colors";
import { HeaderBackButton } from "@react-navigation/elements";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React from "react";

const Layout = () => {
  const router = useRouter();

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
        headerLeft: (props) => (
          <HeaderBackButton
            {...props}
            onPress={() =>
              props.canGoBack ? router.back() : router.replace("/(app)/(home)")
            }
            displayMode="minimal"
            tintColor={COLORS.textColor}
          />
        ),
      }}
    >
      <Stack.Screen
        name="financial-goals"
        options={{ headerBackVisible: false }}
      />
      <Stack.Screen
        name="monthly-income"
        options={{ headerBackVisible: false }}
      />
      <Stack.Screen name="kyc" options={{ headerBackVisible: false }} />
      <Stack.Screen name="your-banks" options={{ headerBackVisible: false }} />
    </Stack>
  );
};

export default Layout;
