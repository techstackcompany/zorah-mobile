import COLORS from "@/constants/colors";
import { stackOptions } from "@/constants/navigation";
import { HeaderBackButton } from "@react-navigation/elements";
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
    <Stack screenOptions={stackOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: "Savings Goals",

          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() =>
                props.canGoBack
                  ? router.back()
                  : router.replace("/(app)/(home)")
              }
              displayMode="minimal"
              tintColor={COLORS.textColor}
            />
          ),
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
