import Text from "@/components/ui/Text";
import { statusMeta } from "@/constants/budgets";
import {
  CategoryIconSource,
  renderCategoryIcon,
} from "@/features/expense-income/utils";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";

export type BudgetCategory = {
  id: string;
  label: string;
  icon: CategoryIconSource;
  allocated: number;
  spent: number;
  remaining?: number;
  status: "on-track" | "approaching" | "exceeded";
};

interface BudgetCardProps {
  budget: BudgetCategory;
  onMorePress: (budget: BudgetCategory) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onMorePress }) => {
  const meta = statusMeta[budget.status];
  const remainingValue =
    budget.remaining !== undefined
      ? budget.remaining
      : Math.max(budget.allocated - budget.spent, 0);

  return (
    <View className="rounded-3xl border border-grayLight bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="w-full flex-row items-start gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary_100">
            {renderCategoryIcon(budget.icon, 28, "#6366F1")}
          </View>
          <View>
            <Text weight="semibold" className="text-base text-textColor">
              {budget.label}
            </Text>
          </View>

          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: meta.badgeBg }}
          >
            <Text className="text-xs" style={{ color: meta.textColor }}>
              {meta.label}
            </Text>
          </View>
          <Pressable className="ml-auto" onPress={() => onMorePress(budget)}>
            <Image
              source={require("@/assets/icons/more.svg")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
        </View>
      </View>

      <View className="mt-4">
        <View className="mb-2 h-2 rounded-full bg-gray-200">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(
                (budget.spent / budget.allocated) * 100,
                100,
              )}%`,
              backgroundColor: meta.accentColor,
            }}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-secondary_500">
            {formatCurrency(budget.spent)} of {formatCurrency(budget.allocated)}
          </Text>
          <Text className="text-sm text-textColor/90">
            {formatCurrency(remainingValue)}{" "}
            <Text className="text-textColor/70">left</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BudgetCard;
