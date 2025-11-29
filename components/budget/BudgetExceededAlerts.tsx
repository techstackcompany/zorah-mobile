import { formatCurrency } from "@/lib/utils";
import { useGetBudgetsQuery } from "@/src/api/hooks";
import { BudgetListItem } from "@/src/api/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import Text from "../ui/Text";

const normalizeBudgets = (
  budgetsData: BudgetListItem[] | { data?: BudgetListItem[] } | undefined,
): BudgetListItem[] => {
  if (!budgetsData) return [];
  if (Array.isArray(budgetsData)) return budgetsData;
  const { data } = budgetsData as { data?: BudgetListItem[] };
  return Array.isArray(data) ? data : [];
};

const isAlmostReached = (budget: BudgetListItem) => {
  const status = budget.status?.toLowerCase() ?? "";
  return status.includes("almost reached");
};

const BudgetExceededAlerts = () => {
  const router = useRouter();
  const { data: budgetsData } = useGetBudgetsQuery();

  const approachingBudgets = useMemo(
    () =>
      normalizeBudgets(budgetsData).filter((budget) => isAlmostReached(budget)),
    [budgetsData],
  );

  if (approachingBudgets.length === 0) return null;

  return (
    <View className="gap-3">
      {approachingBudgets.map((budget) => {
        const spent = budget.totalSpent ?? budget.spent ?? 0;
        const limit = budget.Limit ?? budget.amount ?? 0;
        const budgetId = budget._id;

        return (
          <View
            key={budgetId || budget.category}
            className="rounded-xl border border-red-400 bg-red-100/60 px-2.5 py-5"
          >
            <View className="flex-row items-center justify-between">
              <Image
                source={require("@/assets/icons/info.svg")}
                style={{ width: 24, height: 24, marginRight: 8 }}
              />

              <View className="flex-1 pr-4">
                <Text weight="bold" className="text-sm text-textColor">
                  {budget.category || "Budget"} almost exceeded
                </Text>
                <Text className="mt-2 text-sm text-red-400">
                  {formatCurrency(spent)} of {formatCurrency(limit)}
                </Text>
              </View>
              <Pressable
                className="rounded border border-red-500 px-3 py-2"
                onPress={() => {
                  if (budgetId) {
                    router.push({
                      pathname: "/budget/edit",
                      params: { id: budgetId },
                    });
                  }
                }}
              >
                <Text weight="semibold" className="text-sm  text-red-500">
                  Adjust
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default BudgetExceededAlerts;
