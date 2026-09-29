import { stackOptions } from "@/constants/navigation";
import { useAppLock } from "@/contexts/app-lock/useAppLock";
import { useSession } from "@/contexts/auth-context/useSession";
import { useBillReminderNotifications } from "@/hooks/useBillReminderNotifications";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";

const AppLayout = () => {
  const { signOut, hasCompletedSetup } = useSession();
  const { needsPinSetup, isInitializing } = useAppLock();
  const router = useRouter();
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

  useEffect(() => {
    if (!isInitializing && needsPinSetup) {
      router.replace("/(app)/settings/pin");
    }
  }, [isInitializing, needsPinSetup, router]);

  useEffect(() => {
    let timeout = null;
    if (isProfileLoading || !profileData || profileData.biometricEnabled)
      return;
    const hasMilestone =
      hasCompletedSetup ||
      (profileData?.usageMetrics?.expensesLoggedCount ?? 0) >= 1;
    if (hasMilestone) {
      timeout = setTimeout(() => router.replace("/(app)/settings/pin"), 1000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isProfileLoading, profileData, hasCompletedSetup, router]);

  return <Navigator />;
};

const Navigator = () => {
  return (
    <Stack screenOptions={stackOptions as NativeStackNavigationOptions}>
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
      <Stack.Screen
        name="budget/create"
        options={{
          title: "Create Budget",
        }}
      />
      <Stack.Screen
        name="budget/edit"
        options={{
          title: "Edit Budget",
        }}
      />
      <Stack.Screen
        name="budget/archive"
        options={{
          title: "Archive",
        }}
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

      <Stack.Screen name="transfer" options={{ title: "Transfer" }} />
      <Stack.Screen
        name="transfer-success"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="transfer-receipt"
        options={{ title: "Transaction Details" }}
      />
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

      <Stack.Screen
        name="profile/edit-profile"
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name="profile/change-password"
        options={{ title: "Change Password" }}
      />
      <Stack.Screen name="profile/banks" options={{ title: "Linked Banks" }} />
      <Stack.Screen
        name="profile/kyc-upgrade"
        options={{ title: "Upgrade to Tier 2" }}
      />
      <Stack.Screen name="profile/add-bank" options={{ title: "Add Bank" }} />
      <Stack.Screen name="profile/pin-setup" options={{ headerShown: false }} />

      <Stack.Screen name="settings/pin" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="esusu" options={{ headerShown: false }} />
      <Stack.Screen
        name="debts/index"
        options={{ title: "Debt & Lending Tracker" }}
      />
      <Stack.Screen
        name="debts/details"
        options={{ title: "Debt Details" }}
      />
      <Stack.Screen
        name="debts/record"
        options={{ title: "Record Debt" }}
      />
    </Stack>
  );
};

export default AppLayout;
