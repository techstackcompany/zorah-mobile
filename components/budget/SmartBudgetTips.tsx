import COLORS from "@/constants/colors";
import { useGetFinancialTipQuery } from "@/src/api/hooks/useTipsApi";
import { Image, ImageBackground } from "expo-image";
import React, { memo } from "react";
import { ActivityIndicator, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Text from "../ui/Text";


const markdownStyles = {
  body: {
    color: "rgba(42, 58, 80, 0.8)",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "NunitoMedium",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 10,
  },
  ordered_list_icon: {
    color: COLORS.secondary_500,
    fontFamily: "NunitoBold",
  },
  list_item: {
    marginBottom: 8,
  },
  strong: {
    fontFamily: "NunitoBold",
    color: COLORS.textColor,
  },
};

const SmartBudgetTips = memo(() => {
  const { data, isLoading, error } = useGetFinancialTipQuery();
  const markdownContent = data?.reply?.trim();

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
        {isLoading ? (
          <View className="mt-4 items-start">
            <ActivityIndicator color={COLORS.secondary_500} />
          </View>
        ) : (
          <View className="mt-3">
            {error ? (
              <Text className="mb-2 text-sm text-textColor/80">
                Could not load smart tips right now. Showing default tips
                instead.
              </Text>
            ) : null}
            <Markdown style={markdownStyles}>{markdownContent}</Markdown>
          </View>
        )}
      </ImageBackground>
    </View>
  );
});

SmartBudgetTips.displayName = "SmartBudgetTips";

export default SmartBudgetTips;
