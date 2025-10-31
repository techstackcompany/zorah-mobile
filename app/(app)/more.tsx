import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

type FeatureItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const featureItems: FeatureItem[] = [
  { id: "fund-wallet", label: "Fund Wallet", icon: "wallet-outline" },
  { id: "ai-assistant", label: "AI Assistant", icon: "sparkles-outline" },
  { id: "track-spending", label: "Track Spending", icon: "stats-chart-outline" },
  {
    id: "black-market-fx",
    label: "Black Market FX Rates",
    icon: "swap-horizontal-outline",
  },
  {
    id: "debt-tracker",
    label: "Debt & Lending Tracker",
    icon: "receipt-outline",
  },
  {
    id: "savings-circles",
    label: "Savings Circles (Esusu/Ajo Support)",
    icon: "people-circle-outline",
  },
  { id: "project-wallet", label: "Project Wallet", icon: "briefcase-outline" },
  { id: "tax-management", label: "Tax Management", icon: "document-text-outline" },
  { id: "bill-reminder", label: "Bill Reminder", icon: "calendar-outline" },
  { id: "notifications", label: "Notifications", icon: "notifications-outline" },
];

const MoreScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: "More" }} />
      <MainContainer edges={[]} className="bg-lightMuted">
        <View className="flex-1 px-6 pt-6">
          <View className="rounded-3xl bg-white px-4 py-5">
            <Text weight="semibold" className="text-base text-textColor">
              More Features
            </Text>

            <View className="mt-4">
              {featureItems.map((feature, index) => (
                <Pressable
                  key={feature.id}
                  className={`flex-row items-center justify-between py-4 ${index !== featureItems.length - 1 ? "border-b border-grayLight/70" : ""}`}
                  accessibilityRole="button"
                >
                  <View className="flex-row items-center">
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-lightMuted">
                      <Ionicons
                        name={feature.icon}
                        size={22}
                        color={COLORS.textColor}
                      />
                    </View>
                    <Text weight="bold" className="text-base text-textColor">
                      {feature.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#9AA5B1"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </MainContainer>
    </>
  );
};

export default MoreScreen;
