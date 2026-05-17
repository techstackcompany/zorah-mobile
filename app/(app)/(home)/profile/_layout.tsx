import { headerWithBack } from "@/components/ui/HeaderBack";
import { stackOptions } from "@/constants/navigation";
import { Stack } from "expo-router";
import React from "react";

const ProfileLayout = () => {
  return (
    <Stack screenOptions={stackOptions}>
      <Stack.Screen
        name="index"
        options={{ title: "Account", ...headerWithBack }}
      />
      <Stack.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      <Stack.Screen
        name="change-password"
        options={{ title: "Change Password" }}
      />
      <Stack.Screen name="banks" options={{ title: "Linked Banks" }} />
      <Stack.Screen name="add-bank" options={{ title: "Add Bank" }} />
      <Stack.Screen name="pin-setup" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProfileLayout;
