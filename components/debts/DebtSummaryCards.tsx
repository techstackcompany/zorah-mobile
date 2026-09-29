import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatAmountValue } from "@/lib/amount";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

type Props = {
  totalBorrowed: number;
  totalLent: number;
};

function toRawString(amount: number): string {
  return amount.toFixed(2);
}

export const DebtSummaryCards = ({ totalBorrowed, totalLent }: Props) => {
  return (
    <View className="mb-4 flex-row gap-3">
      {/* You Borrowed */}
      <View className="flex-1 overflow-hidden rounded-2xl">
        <View className="bg-secondary_100 px-3 py-2">
          <View className="flex-row items-center gap-1">
            <Ionicons name="arrow-down" size={14} color={COLORS.secondary_500} />
            <Text
              family="nunito"
              weight="semibold"
              className="text-xs text-secondary_500"
            >
              You Borrowed
            </Text>
          </View>
        </View>
        <View className="bg-secondary_500 px-3 py-3">
          <Text
            family="nunito"
            weight="bold"
            className="text-base text-white"
            numberOfLines={1}
          >
            {formatAmountValue(toRawString(totalBorrowed), {
              currencySymbol: "₦",
              forceFixedDecimals: true,
            })}
          </Text>
        </View>
      </View>

      {/* You Lent */}
      <View className="flex-1 overflow-hidden rounded-2xl">
        <View className="bg-peachTint px-3 py-2">
          <View className="flex-row items-center gap-1">
            <Ionicons name="arrow-up" size={14} color={COLORS.coral} />
            <Text
              family="nunito"
              weight="semibold"
              className="text-xs text-coral"
            >
              You Lent
            </Text>
          </View>
        </View>
        <View className="bg-coral px-3 py-3">
          <Text
            family="nunito"
            weight="bold"
            className="text-base text-white"
            numberOfLines={1}
          >
            {formatAmountValue(toRawString(totalLent), {
              currencySymbol: "₦",
              forceFixedDecimals: true,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};
