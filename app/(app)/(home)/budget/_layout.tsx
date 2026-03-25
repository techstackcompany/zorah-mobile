import { stackOptions } from "@/constants/navigation";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";

const BudgetLayout = () => {
  const router = useRouter();

  const handleAddBudget = useCallback(() => {
    router.push("/(app)/(home)/budget/create");
  }, [router]);

  const handleArchive = useCallback(() => {
    router.push("/(app)/(home)/budget/archive");
  }, [router]);

  return (
    <Stack screenOptions={stackOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: "Budget Manager",
          headerRight: () => (
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={handleAddBudget}
                className="h-10 w-10 items-center justify-center rounded-full "
                accessibilityRole="button"
                accessibilityLabel="Add budget"
              >
                <Image
                  source={require("@/assets/icons/add-budget.svg")}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
              <Pressable
                onPress={handleArchive}
                className="items-center justify-center rounded-full"
                accessibilityRole="button"
                accessibilityLabel="Archive budgets"
              >
                <Image
                  source={require("@/assets/icons/archive.svg")}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Budget",
          headerBackTitleStyle: { fontFamily: "NunitoMedium" },
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Budget",
          headerBackTitleStyle: { fontFamily: "NunitoMedium" },
        }}
      />
      <Stack.Screen
        name="archive"
        options={{
          title: "Archive",
          headerBackTitleStyle: { fontFamily: "NunitoMedium" },
        }}
      />
    </Stack>
  );
};

export default BudgetLayout;
