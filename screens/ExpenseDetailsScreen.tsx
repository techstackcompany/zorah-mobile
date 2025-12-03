import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import {
  CATEGORY_BG_COLOR_MAP,
  CATEGORY_COLOR_MAP,
  CATEGORY_ICON_MAP,
  formatCurrency,
  formatExpenseDate,
} from "@/components/expense-planning/utils";
import COLORS from "@/constants/colors";
import { useDeleteExpenseMutation, useGetExpenseQuery } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const ExpenseDetailsScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const expenseId = params.id;

  const {
    data: expenseData,
    isLoading,
    error,
  } = useGetExpenseQuery(expenseId, {
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to load expense details.",
      });
    },
  });

  const deleteExpenseMutation = useDeleteExpenseMutation(expenseId, {
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "detail", expenseId] });
      const successMessage =
        response?.message ||
        (response?.data as { message?: string } | undefined)?.message ||
        "The expense has been removed from your history.";
      Toast.show({
        type: "success",
        text1: "Expense Deleted",
        text2: successMessage,
      });
      setTimeout(() => {
        router.back();
      }, 800);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: error.message || "Unable to delete this expense. Please try again.",
      });
    },
  });

  const expense = useMemo(() => {
    if (!expenseData) return null;
    return Array.isArray(expenseData)
      ? expenseData[0]
      : expenseData.data || expenseData;
  }, [expenseData]);

  const categoryName = expense?.category || "Other";
  const categoryColor = CATEGORY_COLOR_MAP[categoryName] || "#5D5FFE";
  const categoryIcon = CATEGORY_ICON_MAP[categoryName] || "cash-outline";
  const categoryBg = CATEGORY_BG_COLOR_MAP[categoryName] || "#F6F5FF";

  const formattedDate = useMemo(() => {
    if (!expense?.date) return "";
    return formatExpenseDate(expense.date);
  }, [expense?.date]);

  const fullFormattedDate = useMemo(() => {
    if (!expense?.date) return "";
    try {
      const dateObj = new Date(expense.date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch {
      // Fallback
    }
    return expense.date;
  }, [expense?.date]);

  if (isLoading) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0 pt-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-sm text-textColor/60">
            Loading expense details...
          </Text>
        </View>
      </MainContainer>
    );
  }

  if (error || !expense) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0 pt-6">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.textColor}
            style={{ opacity: 0.4 }}
          />
          <Text weight="semibold" className="mt-4 text-base text-textColor">
            Expense Not Found
          </Text>
          <Text className="mt-2 text-center text-sm text-textColor/60">
            {error?.message || "The expense you're looking for doesn't exist."}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 rounded-lg bg-primary_400 px-6 py-3"
            accessibilityRole="button"
          >
            <Text weight="semibold" className="text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </MainContainer>
    );
  }

  const expenseDetails = [
    {
      id: "category",
      label: "Category",
      value: categoryName,
    },
    {
      id: "date",
      label: "Date",
      value: fullFormattedDate || formattedDate || "N/A",
    },
    {
      id: "paymentMethod",
      label: "Payment Method",
      value: expense.paymentMethod || "Not specified",
    },
    {
      id: "createdAt",
      label: "Recorded",
      value: expense.createdAt
        ? new Date(expense.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
    },
  ];

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0 pt-6">
      <View className="flex-1">
        <ScrollView
          className="mt-2 flex-1"
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            {/* Summary Card */}
            <View
              className="rounded-t-lg p-6"
              style={{ backgroundColor: categoryBg }}
            >
              <View className="items-center">
                <View
                  style={[styles.expenseIcon, { backgroundColor: categoryBg }]}
                >
                  <Ionicons name={categoryIcon} size={32} color={categoryColor} />
                </View>
                <Text
                  weight="semibold"
                  className="mt-4 text-center text-base text-textColor"
                >
                  {categoryName}
                </Text>
                <Text
                  weight="bold"
                  className="mt-4 text-center text-2xl text-textColor"
                >
                  {formatCurrency(expense.amount || 0)}
                </Text>
                {formattedDate && (
                  <View className="mt-4">
                    <View className="rounded-full bg-white px-4 py-1.5">
                      <Text weight="semibold" className="text-xs text-primary_400">
                        {formattedDate}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Details Card */}
            <View className="bg-white p-6 shadow-sm">
              <Text weight="semibold" className="text-base text-textColor">
                Expense Details
              </Text>

              <View className="mt-5 gap-5">
                {expenseDetails.map((detail) => (
                  <View
                    key={detail.id}
                    className="flex-row items-center justify-between"
                  >
                    <Text
                      className="text-sm text-textColor/60"
                      numberOfLines={1}
                    >
                      {detail.label}
                    </Text>
                    <Text
                      weight="semibold"
                      className="text-sm text-textColor"
                      numberOfLines={1}
                    >
                      {detail.value}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Description Section */}
              {expense.description && (
                <View className="mt-6">
                  <Text weight="semibold" className="text-sm text-textColor">
                    Description
                  </Text>
                  <View className="mt-2 rounded-lg bg-lightMuted px-4 py-3">
                    <Text className="text-sm text-textColor">
                      {expense.description}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-6 pb-8">
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-lg border border-primary_400 py-4"
              accessibilityRole="button"
              onPress={() => {
                if (expenseId) {
                  router.push({
                    pathname: "/expenses/edit",
                    params: { id: expenseId },
                  });
                }
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={18}
                color={COLORS.primary_400}
              />
              <Text weight="semibold" className="ml-2 text-primary_400">
                Edit
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-lg bg-primary_400 py-4"
              accessibilityRole="button"
              onPress={() => {
                if (!deleteExpenseMutation.isPending) {
                  deleteExpenseMutation.mutate();
                }
              }}
              disabled={deleteExpenseMutation.isPending}
              style={{
                opacity: deleteExpenseMutation.isPending ? 0.6 : 1,
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text weight="semibold" className="ml-2 text-white">
                {deleteExpenseMutation.isPending ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  expenseIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ExpenseDetailsScreen;
