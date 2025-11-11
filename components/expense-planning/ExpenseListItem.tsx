import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

export type ExpenseItem = {
  _id?: string;
  id?: string;
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  paymentMethod?: string;
};

type ExpenseListItemProps = {
  expense: ExpenseItem;
  isLast?: boolean;
  categoryColor: string;
  categoryIcon: keyof typeof Ionicons.glyphMap;
  categoryBg: string;
  formattedDate: string;
  formatCurrency: (value: number) => string;
};

const ExpenseListItem = ({
  expense,
  isLast = false,
  categoryColor,
  categoryIcon,
  categoryBg,
  formattedDate,
  formatCurrency,
}: ExpenseListItemProps) => {
  const categoryName = expense.category || "Other";
  const expenseId = expense._id || expense.id || "";

  return (
    <View
      key={expenseId}
      className={`flex-row items-center gap-4 ${isLast ? "" : "border-b border-grayLight/60 pb-4"}`}
    >
      <View style={[styles.expenseIcon, { backgroundColor: categoryBg }]}>
        <Ionicons name={categoryIcon} size={20} color={categoryColor} />
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
          {formattedDate && (
            <>
              {expense.description && (
                <Text className="text-xs text-textColor/40">•</Text>
              )}
              <Text className="text-xs text-textColor/60">{formattedDate}</Text>
            </>
          )}
          {expense.paymentMethod && (
            <>
              {(expense.description || formattedDate) && (
                <Text className="text-xs text-textColor/40">•</Text>
              )}
              <Text className="text-xs text-textColor/60">
                {expense.paymentMethod}
              </Text>
            </>
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
