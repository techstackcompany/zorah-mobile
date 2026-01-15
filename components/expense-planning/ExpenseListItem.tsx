import Text from "@/components/ui/Text";
import { ExpenseItem } from "@/features/expense-income/types";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

type ExpenseListItemProps = {
  expense: ExpenseItem;
  isLast?: boolean;
  categoryColor: string;
  categoryIconSource: string;
  categoryBg: string;
  formattedDate: string;
  formatCurrency: (value: number) => string;
};

const ExpenseListItem = ({
  expense,
  isLast = false,
  categoryColor,
  categoryIconSource,
  categoryBg,
  formatCurrency,
}: ExpenseListItemProps) => {
  const categoryName = expense.category || "Other";
  const expenseId = expense._id || "";

  return (
    <View
      key={expenseId}
      className={`flex-row items-center gap-4 ${isLast ? "" : "border-b border-grayLight/60 pb-4"}`}
    >
      <View style={[styles.expenseIcon, { backgroundColor: categoryBg }]}>
        <Image
          source={{ uri: categoryIconSource }}
          style={{ width: 20, height: 20 }}
          tintColor={categoryColor}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text weight="semibold" className="text-sm text-textColor">
            {categoryName}
          </Text>
          <Text weight="bold" className="text-sm text-textColor">
            {formatCurrency(expense.amount || 0)}
          </Text>
        </View>
        <View className="mt-1 flex-row items-center gap-2">
          {expense.description && (
            <Text className="text-xs text-textColor/60" numberOfLines={1}>
              {expense.description}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ExpenseListItem;
