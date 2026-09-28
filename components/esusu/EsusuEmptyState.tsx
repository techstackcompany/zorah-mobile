import Text from "@/components/ui/Text";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

interface EsusuEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export const EsusuEmptyState = ({
  title = "No group savings",
  subtitle = "All group savings will appear here",
}: EsusuEmptyStateProps) => {
  return (
    <View className="mt-4 items-center justify-center rounded-2xl border-gray-100 bg-white px-6 py-10">
      <Image
        source={require("@/assets/images/esusu/esusu-empty.png")}
        style={{ width: "100%", height: 160, maxWidth: 260 }}
        contentFit="contain"
      />
      <Text family="nunito" weight="semibold" className="mt-4 text-center text-base text-textColor">
        {title}
      </Text>
      <Text family="nunito" weight="regular" className="mt-1 text-center text-xs text-textColor/60">
        {subtitle}
      </Text>
    </View>
  );
};
