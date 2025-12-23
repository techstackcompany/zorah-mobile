import DeleteBudgetModal from "@/components/budget/DeleteBudgetModal";
import {
  CATEGORY_BG_COLOR_MAP,
  CATEGORY_COLOR_MAP,
  CATEGORY_ICON_MAP,
  formatCurrency,
  formatExpenseDate,
} from "@/features/expense-income/utils";
import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { capitalizeWord } from "@/lib/utils";
import { useDeleteIncomeMutation, useGetIncomeQuery } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const IncomeDetailsScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const incomeId = params.id;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: incomeData, isLoading, error } = useGetIncomeQuery(incomeId);

  const deleteIncomeMutation = useDeleteIncomeMutation(incomeId, {
    onSuccess: () => {
      // Invalidate income queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["income"] });
      Toast.show({ type: "success", text1: "Income deleted successfully" });
      setShowDeleteModal(false);
      router.back();
    },
    onError: (error) => {
      console.log("error", error.message);
      Toast.show({ type: "error", text1: "Failed to delete income" });
    },
  });

  const handleDelete = () => {
    deleteIncomeMutation.mutate();
  };

  const income = useMemo(() => {
    if (!incomeData) return null;
    return Array.isArray(incomeData)
      ? incomeData[0]
      : incomeData.data || incomeData;
  }, [incomeData]);

  const categoryName = income?.category || "Other";
  const categoryColor = CATEGORY_COLOR_MAP[categoryName] || "#5D5FFE";
  const categoryIcon = CATEGORY_ICON_MAP[categoryName] || "cash-outline";
  const categoryBg = CATEGORY_BG_COLOR_MAP[categoryName] || "#F6F5FF";

  const formattedDate = useMemo(() => {
    if (!income?.date) return "";
    return formatExpenseDate(income.date);
  }, [income?.date]);

  const fullFormattedDate = useMemo(() => {
    if (!income?.date) return "";
    try {
      const dateObj = new Date(income.date);
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
    return income.date;
  }, [income?.date]);

  if (isLoading) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0 pt-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-sm text-textColor/60">
            Loading income details...
          </Text>
        </View>
      </MainContainer>
    );
  }

  if (error || !income) {
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
            Income Not Found
          </Text>
          <Text className="mt-2 text-center text-sm text-textColor/60">
            {error?.message || "The income you're looking for doesn't exist."}
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

  const incomeDetails = [
    {
      id: "category",
      label: "Category",
      value: capitalizeWord(categoryName),
    },
    {
      id: "date",
      label: "Date",
      value: fullFormattedDate || formattedDate || "N/A",
    },
    {
      id: "source",
      label: "Payment Method",
      value: capitalizeWord(income.source) || "Not specified",
    },
    {
      id: "createdAt",
      label: "Recorded",
      value: income.createdAt
        ? new Date(income.createdAt).toLocaleDateString("en-US", {
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
                  style={[styles.incomeIcon, { backgroundColor: categoryBg }]}
                >
                  <Ionicons
                    name={categoryIcon}
                    size={32}
                    color={categoryColor}
                  />
                </View>
                <Text
                  weight="semibold"
                  className="mt-4 text-center text-base text-textColor"
                >
                  {capitalizeWord(income.category)}
                </Text>
                <Text
                  weight="bold"
                  className="mt-4 text-center text-2xl text-textColor"
                >
                  {formatCurrency(income.amount || 0)}
                </Text>
                {formattedDate && (
                  <View className="mt-4">
                    <View className="rounded-full bg-white px-4 py-1.5">
                      <Text
                        weight="semibold"
                        className="text-xs text-primary_400"
                      >
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
                Income Details
              </Text>

              <View className="mt-5 gap-5">
                {incomeDetails.map((detail) => (
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
              {income.description && (
                <View className="mt-6">
                  <Text weight="semibold" className="text-sm text-textColor">
                    Description
                  </Text>
                  <View className="mt-2 rounded-lg bg-lightMuted px-4 py-3">
                    <Text className="text-sm text-textColor">
                      {income.description}
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
                router.push({
                  pathname: "/income/edit",
                  params: { id: incomeId },
                });
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
              onPress={() => setShowDeleteModal(true)}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text weight="semibold" className="ml-2 text-white">
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <DeleteBudgetModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        budgetName={
          income
            ? `${capitalizeWord(income.category)}${income.description ? ` - ${income.description}` : ""}`
            : undefined
        }
        isDeleting={deleteIncomeMutation.isPending}
      />
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  incomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default IncomeDetailsScreen;
