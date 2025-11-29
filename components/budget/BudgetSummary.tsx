import CircularProgress from "@/components/ui/CircularProgress";
import Text from "@/components/ui/Text";
import { formatCurrency } from "@/lib/utils";
import React from "react";
import { View } from "react-native";

type BudgetSummaryProps = {
  percentUsed: number;
  totalBudget: number;
  totalSpent: number;
  formattedRemaining: string;
};

const BudgetSummary = ({
  percentUsed,
  totalBudget,
  totalSpent,
  formattedRemaining,
}: BudgetSummaryProps) => {
  return (
    <View className="mt-6">
      <View className="items-center justify-center">
        <CircularProgress progress={percentUsed}>
          <View className="size-36 items-center justify-center rounded-full bg-white">
            <Text weight="semibold" className="text-3xl">
              {percentUsed}%
            </Text>
            <Text className="text-xs text-textColor/60">Used</Text>
          </View>
        </CircularProgress>
      </View>

      <View className="mt-6 flex-row justify-between">
        <View>
          <Text className="text-xs uppercase text-textColor/60">
            Total Budget
          </Text>
          <Text weight="semibold" className="mt-1 text-base text-textColor">
            {formatCurrency(totalBudget)}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs uppercase text-textColor/60">
            Total Spent
          </Text>
          <Text weight="semibold" className="mt-1 text-base text-orange">
            {formatCurrency(totalSpent)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs uppercase text-textColor/60">
            Remaining
          </Text>
          <Text
            weight="semibold"
            className="mt-1 text-base"
            style={{ color: "#2FA89A" }}
          >
            {formattedRemaining}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BudgetSummary;
