import { Stack } from "expo-router";
import React from "react";

const ProfileLayout = () => {
  return (
    <Stack
      screenOptions={{
        statusBarStyle: "dark",
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: "NunitoSemibold" },
        headerBackTitleStyle: { fontFamily: "NunitoSemibold" },
      }}
    >
      <Stack.Screen
        name="edit-profile"
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen name="banks" options={{ title: "Linked Banks" }} />
      <Stack.Screen name="add-bank" options={{ title: "Add Bank" }} />
      <Stack.Screen
        name="kyc-verification"
        options={{ title: "KYC Verification" }}
      />
    </Stack>
  );
};

export default ProfileLayout;

