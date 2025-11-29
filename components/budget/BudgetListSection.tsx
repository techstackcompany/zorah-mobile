import BudgetCard, { BudgetCategory } from "@/components/budget/BudgetCard";
import Text from "@/components/ui/Text";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

type BudgetListSectionProps = {
  budgets: BudgetCategory[];
  isLoading: boolean;
  onMorePress: (budget: BudgetCategory) => void;
};

const BudgetListSection = ({
  budgets,
  isLoading,
  onMorePress,
}: BudgetListSectionProps) => {
  return (
    <View className="mt-6 px-6">
      <Text weight="semibold" className="text-lg text-textColor">
        Budget Category
      </Text>

      {isLoading ? (
        <View className="mt-4">
          <Text className="text-center text-textColor/60">
            Loading budgets...
          </Text>
        </View>
      ) : budgets.length === 0 ? (
        <View className="items-center justify-center gap-4 py-10">
          <Image
            source={require("@/assets/images/home/no-recent-trans.svg")}
            style={{ width: 170, height: 162 }}
          />
          <Text className="text-center text-textColor/60">
            No budgets found. Create your first budget to get started.
          </Text>
        </View>
      ) : (
        <View className="mt-4 gap-4">
          {budgets.map((budget, idx) => (
            <BudgetCard
              key={budget.id || idx}
              budget={budget}
              onMorePress={onMorePress}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default BudgetListSection;
