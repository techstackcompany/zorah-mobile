import { ScalePressable } from "@/components/ui/ScalePressable";
import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface EsusuActionBannerProps {
  onCreatePress?: () => void;
}

export const EsusuActionBanner = ({
  onCreatePress,
}: EsusuActionBannerProps) => {
  const handlePress = () => {
    // TODO: wire to API
    onCreatePress?.();
  };

  return (
    <View className="mt-4 rounded-2xl bg-[#EDF2FE] p-5">
      <Text family="nunito" weight="bold" className="text-2xl text-textColor">
        Group Savings
      </Text>
      <Text
        family="nunito"
        weight="regular"
        className="mt-1 text-sm text-textColor/70"
      >
        Manage your Ajo/Esusu savings groups
      </Text>

      <ScalePressable
        scaleTo={0.97}
        onPress={handlePress}
        className="bg-primary_300 mt-4 flex-row items-center self-start rounded-xl px-4 py-2.5 active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel="Create New Group"
      >
        <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
        <Text
          family="nunito"
          weight="semibold"
          className="ml-2 text-base text-white"
        >
          Create New Group
        </Text>
      </ScalePressable>
    </View>
  );
};
