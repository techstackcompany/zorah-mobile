import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ExpenseListItem, { ExpenseItem } from "./ExpenseListItem";

type ExpenseListProps = {
  expenses: ExpenseItem[];
  isLoading?: boolean;
  categoryColorMap: Record<string, string>;
  categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap>;
  categoryBgMap: Record<string, string>;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
  type?: "expense" | "income"; 
};

const SKELETON_ROWS = Array.from({ length: 3 }, (_, index) => index);

const ExpenseList = ({
  expenses,
  isLoading = false,
  categoryColorMap,
  categoryIconMap,
  categoryBgMap,
  formatCurrency,
  formatDate,
  type = "expense",
}: ExpenseListProps) => {
  const router = useRouter();
  if (isLoading) {
    return (
      <View className="gap-4">
        {SKELETON_ROWS.map((row) => (
          <View key={row} className="flex-row items-center gap-4">
            <View style={styles.skeletonIcon} />
            <View className="flex-1 gap-2">
              <View style={styles.skeletonLinePrimary} />
              <View style={styles.skeletonLineSecondary} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.expenseEmptyState}>
        <Ionicons
          name="receipt-outline"
          size={32}
          color={COLORS.textColor}
          style={{ opacity: 0.4 }}
        />
        <Text className="mt-3 text-sm text-textColor/60">
          {type === "income"
            ? "No income recorded yet. Add your first income to get started."
            : "No expenses recorded yet. Add your first expense to get started."}
        </Text>
      </View>
    );
  }

  const handleItemPress = (item: ExpenseItem) => {
    const itemId = item._id || item.id;
    if (itemId) {
      const pathname =
        type === "income"
          ? "/(app)/income/details"
          : "/(app)/expenses/details";
      router.push({
        pathname,
        params: { id: itemId },
      });
    }
  };

  return (
    <View className="gap-4">
      {expenses.slice(0, 10).map((expense, index, array) => {
        const isLast = index === array.length - 1;
        const categoryName = expense.category || "Other";
        const categoryColor = categoryColorMap[categoryName] || "#5D5FFE";
        const categoryIcon = categoryIconMap[categoryName] || "cash-outline";
        const categoryBg = categoryBgMap[categoryName] || "#F6F5FF";

        const formattedDate = expense.date ? formatDate(expense.date) : "";
        const expenseId = expense._id || expense.id;

        return (
          <Pressable
            key={expenseId || index}
            onPress={() => handleItemPress(expense)}
            accessibilityRole="button"
          >
            <ExpenseListItem
              expense={expense}
              isLast={isLast}
              categoryColor={categoryColor}
              categoryIcon={categoryIcon}
              categoryBg={categoryBg}
              formattedDate={formattedDate}
              formatCurrency={formatCurrency}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
  },
  skeletonLinePrimary: {
    height: 8,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
    width: "90%",
  },
  skeletonLineSecondary: {
    height: 7,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
    width: "60%",
  },
  expenseEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
});

export default ExpenseList;
