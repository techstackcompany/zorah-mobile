import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";

const SavingsGoalsLayout = () => {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        statusBarStyle: "dark",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerTitle: "Goal Details",
        }}
      />
      <Stack.Screen
        name="add-money"
        options={{
          headerTitle: "Add Money",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerTitle: "Create Goal",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/savings-goals/create")}
              className="h-10 w-10 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Create another goal"
            >
              <Ionicons name="add" size={24} color={COLORS.primary_400} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
};

export default SavingsGoalsLayout;
