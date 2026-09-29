import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

type FeatureItem = {
  id: string;
  label: string;
  icon: ImageSource;
};

const featureItems: FeatureItem[] = [
  {
    id: "fund-wallet",
    label: "Fund Wallet",
    icon: require("@/assets/icons/wallet.svg"),
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: require("@/assets/icons/ai_bot.svg"),
  },
  {
    id: "track-spending",
    label: "Track Spending",
    icon: require("@/assets/icons/track-spending.svg"),
  },
  {
    id: "black-market-fx",
    label: "FX Rates",
    icon: require("@/assets/icons/black_market_fx.svg"),
  },
  {
    id: "bill-reminder",
    label: "Bill Reminder",
    icon: require("@/assets/icons/bill-reminder.svg"),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: require("@/assets/icons/notifications.svg"),
  },
  {
    id: "debt-lending",
    label: "Debt & Lending",
    icon: require("@/assets/icons/debt-lending.svg"),
  },
];

const MoreScreen = () => {
  const router = useRouter();

  const handleFeaturePress = (feature: FeatureItem) => {
    if (feature.id === "fund-wallet") {
      router.push("/(app)/fund-wallet");
    } else if (feature.id === "track-spending") {
      router.push("/(app)/track-spending");
    } else if (feature.id === "ai-assistant") {
      router.push("/(app)/ai-assistant");
    } else if (feature.id === "black-market-fx") {
      router.push("/fxRates");
    } else if (feature.id === "bill-reminder") {
      router.push("/(app)/bill-reminder");
    } else if (feature.id === "notifications") {
      router.push("/(app)/notifications");
    } else if (feature.id === "debt-lending") {
      router.push("/(app)/debts");
    }
  };

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
                  onPress={() => handleFeaturePress(feature)}
                >
                  <View className="flex-row items-center">
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-lightMuted">
                      <Image
                        source={feature.icon}
                        style={{ width: 22, height: 22 }}
                      />
                    </View>
                    <Text weight="bold" className="text-base text-textColor">
                      {feature.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9AA5B1" />
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
