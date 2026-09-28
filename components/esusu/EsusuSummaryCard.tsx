import Text from "@/components/ui/Text";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface EsusuSummaryCardProps {
  totalContribution: number;
  activeGroupCount: number;
  growthPercentage: number;
}

export const EsusuSummaryCard = ({
  totalContribution,
  activeGroupCount,
  growthPercentage,
}: EsusuSummaryCardProps) => {
  const formattedAmount = formatCurrencyWithSymbol(totalContribution, "₦ ");

  return (
    <View className="rounded-2xl bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text family="nunito" weight="medium" className="text-sm text-textColor/70">
          Total Contribution
        </Text>
        <Text family="nunito" weight="regular" className="text-sm text-textColor/70">
          Active Group:{" "}
          <Text family="nunito" weight="bold" className="text-textColor">
            {activeGroupCount}
          </Text>
        </Text>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text family="nunito" weight="bold" className="text-4xl text-textColor">
          {formattedAmount}
        </Text>

        <View className="flex-row items-center rounded-md bg-[#E8F8EE] px-3 py-1.5">
          <Feather name="trending-up" size={13} color="#32A34D" />
          <Text family="nunito" weight="semibold" className="ml-1 text-xs text-secondary_500">
            {growthPercentage}%
          </Text>
        </View>
      </View>
    </View>
  );
};
