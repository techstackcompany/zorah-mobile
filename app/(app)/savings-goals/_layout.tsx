import { HeaderBack } from "@/components/ui/HeaderBack";
import { stackOptions } from "@/constants/navigation";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

const SavingsGoalsLayout = () => {
  const router = useRouter();
  const handleCreateGoal = () => {
    router.navigate("/savings-goals/create");
  };
  return (
    <Stack screenOptions={stackOptions as NativeStackNavigationOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: "Savings Goals",
          // First screen of this nested stack: no native back exists here,
          // so render the glass-matched HeaderBack (falls back to home).
          headerLeft: () => <HeaderBack />,
          headerRight: () => (
            <Pressable
              onPress={handleCreateGoal}
              className="h-10 w-10 items-center justify-center rounded-full "
              accessibilityRole="button"
              accessibilityLabel="Create Goal"
            >
              <Image
                source={require("@/assets/icons/add-budget.svg")}
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          ),
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
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerTitle: "Edit Goal",
        }}
      />
    </Stack>
  );
};

export default SavingsGoalsLayout;
