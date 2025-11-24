import COLORS from "@/constants/colors";
import { Image, ImageBackground } from "expo-image";
import React, { memo } from "react";
import { View } from "react-native";
import Text from "../ui/Text";

const SmartBudgetTips = memo(() => {
  return (
    <View className="mt-6 px-6">
      <ImageBackground
        style={{
          backgroundColor: COLORS.secondary_200,
          padding: 20,
          borderRadius: 24,
        }}
        source={require("@/assets/images/bg-patterns/fold-pattern.png")}
      >
        <View className="flex-row items-center gap-3">
          <Image
            source={require("@/assets/icons/clock.svg")}
            style={{ width: 20, height: 20 }}
          />
          <Text weight="bold" className="text-lg">
            Smart Budget Tips
          </Text>
        </View>
        <View className="mt-3 space-y-3">
          <View className="flex-row items-start gap-2">
            <View
              className="mt-1.5 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: COLORS.secondary_500 }}
            />
            <Text className="mb-3 flex-1 text-sm text-textColor/80">
              <Text className="mb-1 text-base">
                Reduce food expenses by ₦5,000
              </Text>
              {"\n"}
              You&apos;re spending ₦20,000 more than similar users. Try cooking
              at home 2 more days weekly.
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <View
              className="mt-1.5 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: COLORS.secondary_500 }}
            />
            <Text className="flex-1 text-sm text-textColor/80">
              <Text className="mb-1 text-base">Set up Down Owambe budget</Text>
              {"\n"}
              December is party season! Create a separate budget for events and
              overspending.
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
});

SmartBudgetTips.displayName = "SmartBudgetTips";

export default SmartBudgetTips;
