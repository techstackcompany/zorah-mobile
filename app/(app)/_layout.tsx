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
     
     
      <Stack.Screen
        name="track-spending"
        options={{ title: "Track Spending" }}
      />
      <Stack.Screen
        name="bill-reminder/index"
        options={{ title: "Bills Reminder" }}
      />
      <Stack.Screen
        name="tax-management/index"
        options={{ title: "Tax Management" }}
      />
      <Stack.Screen
        name="bill-reminder/add-bill"
        options={{ title: "Add Bill" }}
      />
      <Stack.Screen name="savings-goals" options={{ headerShown: false }} />
      <Stack.Screen name="ai-assistant" options={{ title: "AI Assistant" }} />

      <Stack.Screen
        name="profile/edit-profile"
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen name="profile/banks" options={{ title: "Linked Banks" }} />
      <Stack.Screen name="profile/add-bank" options={{ title: "Add Bank" }} />
      <Stack.Screen
        name="debt-tracker/index"
        options={{ title: "Debt & Lending Tracker" }}
      />
      <Stack.Screen
        name="debt-tracker/details"
        options={{ title: "Debt Details" }}
      />
      <Stack.Screen
        name="debt-tracker/record"
        options={{ title: "Record Debt" }}
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
        name="esusu"
        options={{headerShown:false}}
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
        name="push-notification-test"
        options={{ title: "Push Notification Test" }}
      />
      <Stack.Screen
        name="settings/biometrics"
        options={{ title: "Biometric Login" }}
      />
      <Stack.Screen
        name="settings/privacy"
        options={{ title: "Privacy" }}
      />
    </Stack>
  );
};

export default AppLayout;
