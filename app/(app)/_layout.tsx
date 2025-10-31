import { Stack } from "expo-router";
import React from "react";

const AppLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerBackTitleStyle: { fontFamily: "NunitoSemibold" },
      }}
    >
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen
        name="expense-planning"
        options={{ title: "Expense Planning" }}
      />
      <Stack.Screen name="add-expense" options={{ title: "Add Expense" }} />
      <Stack.Screen name="add-income" options={{ title: "Add Income" }} />
      <Stack.Screen name="more" options={{ title: "More" }} />
      <Stack.Screen name="fund-wallet/index" options={{ title: "Fund Wallet" }} />
      <Stack.Screen
        name="fund-wallet/bank-transfer"
        options={{ title: "Bank Transfer" }}
      />
      <Stack.Screen
        name="fund-wallet/bank-ussd"
        options={{ title: "Bank USSD" }}
      />
      <Stack.Screen
        name="transactions/index"
        options={{ title: "Transaction History" }}
      />
      <Stack.Screen
        name="transactions/details"
        options={{ title: "Transaction History" }}
      />
    </Stack>
  );
};

export default AppLayout;
