import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

const PortfolioLayout = () => {
  const router = useRouter();

  const handleAddInvestment = () => {
    router.push("/investment/add");
  };

  return (
    <Stack
      screenOptions={{
        statusBarStyle: "dark",
        headerTitleStyle: { fontFamily: "NunitoSemibold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Investment Portfolio",
          headerRight: () => (
            <Pressable
              onPress={handleAddInvestment}
              className="h-10 w-10 items-center justify-center rounded-full "
              accessibilityRole="button"
              accessibilityLabel="Add budget"
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
          headerTitle: "Investment Details",
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          headerTitle: "Add Investment",
        }}
      />
    </Stack>
  );
};

export default PortfolioLayout;
