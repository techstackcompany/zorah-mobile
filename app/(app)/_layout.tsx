import { stackOptions } from "@/constants/navigation";
import { useSession } from "@/contexts/auth-context/useSession";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { useBillReminderNotifications } from "@/hooks/useBillReminderNotifications";

const AppLayout = () => {
  const { signOut } = useSession();
  useBillReminderNotifications();

  const {
    isLoading: isProfileLoading,
    error,
    data: profileData,
  } = useGetUserProfileQuery();

  useEffect(() => {
    if (!isProfileLoading) {
      SplashScreen.hideAsync();
    }
  }, [isProfileLoading]);

  useEffect(() => {
    if (error) {
      signOut();
    }
  }, [signOut, error]);

  return <Navigator />;
};

const Navigator = () => {
  return (
    <Stack screenOptions={stackOptions}>
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen
        name="expense-planning"
        options={{ title: "Expense Report" }}
      />
      <Stack.Screen name="add-expense" options={{ title: "Add Expense" }} />
      <Stack.Screen
        name="expenses/details"
        options={{ title: "Expense Details" }}
      />
      <Stack.Screen name="expenses/edit" options={{ title: "Edit Expense" }} />
      <Stack.Screen name="add-income" options={{ title: "Add Income" }} />
      <Stack.Screen
        name="income/details"
        options={{ title: "Income Details" }}
      />
      <Stack.Screen name="more" options={{ title: "More" }} />
      <Stack.Screen
        name="track-spending"
        options={{ title: "Track Spending" }}
      />
      <Stack.Screen
        name="bill-reminder/index"
        options={{ title: "Bills Reminder" }}
      />
      <Stack.Screen
        name="bill-reminder/add-bill"
        options={{ title: "Add Bill" }}
      />
      <Stack.Screen name="savings-goals" options={{ headerShown: false }} />
      <Stack.Screen name="ai-assistant" options={{ title: "AI Assistant" }} />

      <Stack.Screen
        name="fund-wallet/index"
        options={{ title: "Fund Wallet" }}
      />
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
      <Stack.Screen
        name="notifications/index"
        options={{ title: "Notifications" }}
      />

      <Stack.Screen name="settings/pin" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AppLayout;
