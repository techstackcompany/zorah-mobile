import BudgetActionSheet from "@/components/budget/BudgetActionSheet";
import BudgetCard from "@/components/budget/BudgetCard";
import BudgetExceededAlert from "@/components/budget/BudgetExceededAlert";
import DeleteBudgetModal from "@/components/budget/DeleteBudgetModal";
import SmartBudgetTips from "@/components/budget/SmartBudgetTips";
import MainContainer from "@/components/layouts/MainContainer";
import CircularProgress from "@/components/ui/CircularProgress";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatCurrency } from "@/lib/utils";
import {
  useArchiveBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetsQuery,
  useGetCategoriesQuery,
} from "@/src/api/hooks";
import { BudgetListItem } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

type BudgetCategory = {
  id: string;
  label: string;
  icon: ImageSource;
  allocated: number;
  spent: number;
  remaining?: number;
  status: "on-track" | "approaching" | "exceeded";
};

const getBudgetStatus = (
  spent: number,
  allocated: number,
): "on-track" | "approaching" | "exceeded" => {
  if (spent > allocated) return "exceeded";
  const percentage = (spent / allocated) * 100;
  if (percentage >= 80) return "approaching";
  return "on-track";
};

const transformBudgets = (
  budgetsData: BudgetListItem[],
  subcategories: { key: string; label: string; icon: string }[],
) => {
  return budgetsData.map((budget: BudgetListItem) => {
    const spent = budget.totalSpent || 0;
    const allocated = budget.Limit || 0;
    const remaining =
      budget.remaining !== undefined
        ? budget.remaining
        : Math.max(allocated - spent, 0);

    let status: "on-track" | "approaching" | "exceeded";
    if (budget.status) {
      const statusLower = budget.status.toLowerCase();
      if (
        statusLower.includes("exceeded") ||
        statusLower.includes("over budget") ||
        statusLower.includes("over")
      ) {
        status = "exceeded";
      } else if (
        statusLower.includes("approaching") ||
        statusLower.includes("warning")
      ) {
        status = "approaching";
      } else {
        status = "on-track";
      }
    } else {
      status = getBudgetStatus(spent, allocated);
    }

    return {
      id: budget?._id,
      label: budget.category || "Unknown",
      icon:
        subcategories?.find(
          (subcategory) => subcategory.key === budget.category,
        )?.icon || "",
      allocated,
      spent,
      remaining,
      status,
    };
  });
};

const useSubcategories = () => {
  const { data: subcategoriesData } = useGetCategoriesQuery("budget");
  return subcategoriesData?.data?.subcategories.map((subcategory) => ({
    key: subcategory.name,
    label: subcategory.name,
    icon: subcategory.image || "",
  }));
};

const useBudgetActions = () => {
  const [activeCategory, setActiveCategory] = useState<BudgetCategory | null>(
    null,
  );
  const [enableDeleteWarning, setEnableDeleteWarning] = useState(false);
  const [budgetIdToDelete, setBudgetIdToDelete] = useState<string | null>(null);
  const [budgetIdToArchive, setBudgetIdToArchive] = useState<string | null>(
    null,
  );

  const queryClient = useQueryClient();
  const deleteBudgetMutation = useDeleteBudgetMutation(
    budgetIdToDelete || undefined,
    {
      onSuccess: () => {
        // Invalidate budgets query to refetch the list
        
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        Toast.show({ type: "success", text1: "Budget deleted successfully" });
        setBudgetIdToDelete(null);
        setActiveCategory(null);
      },
      onError: (error) => {
        console.log("error", error.message);
        Toast.show({ type: "error", text1: "Failed to delete budget" });
      },
    },
  );

  const archiveBudgetMutation = useArchiveBudgetMutation(
    budgetIdToArchive || undefined,
    {
      onSuccess: () => {
        // Invalidate budgets query to refetch the list
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "archived"] });
        Toast.show({ type: "success", text1: "Budget archived successfully" });
        setBudgetIdToArchive(null);
        setActiveCategory(null);
        setIsActionSheetOpen(false);
      },
      onError: (error) => {
        console.log("error", error.message);
        Toast.show({ type: "error", text1: "Failed to archive budget" });
        setBudgetIdToArchive(null);
      },
    },
  );

  // Trigger archive mutation when budgetIdToArchive is set
  useEffect(() => {
    if (budgetIdToArchive && !archiveBudgetMutation.isPending) {
      archiveBudgetMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetIdToArchive]);

  const handleArchiveBudget = (budgetId: string) => {
    setBudgetIdToArchive(budgetId);
  };
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const closeActionSheet = () => {
    setIsActionSheetOpen(false);
    setActiveCategory(null);
  };

  const openActionSheet = (category: BudgetCategory) => {
    setIsActionSheetOpen(true);
    setActiveCategory(category);
  };

  const actions = [
    {
      label: "Edit",
      enabled: true,
      action: () => {
        router.push({
          pathname: "/budget/edit",
          params: { id: activeCategory?.id },
        });
      },
    },
    {
      label: "Delete",
      enabled: true,
      action: () => {
        if (activeCategory?.id) {
          setBudgetIdToDelete(activeCategory.id);
          setEnableDeleteWarning(true);
          setIsActionSheetOpen(false);
        }
      },
    },
    {
      label: "Archive",
      enabled: true,
      action: () => {
        if (activeCategory?.id) {
          setIsActionSheetOpen(false);
          handleArchiveBudget(activeCategory.id);
        }
      },
    },
  ];

  const handleDeleteBudget = () => {
    if (!budgetIdToDelete) {
      Toast.show({ type: "error", text1: "Budget ID not found" });
      setEnableDeleteWarning(false);
      return;
    }
    deleteBudgetMutation.mutate();
    setEnableDeleteWarning(false);
  };

  return {
    activeCategory,
    setActiveCategory,
    isActionSheetOpen,
    setIsActionSheetOpen,
    actions,
    deleteBudget: handleDeleteBudget,
    enableDeleteWarning,
    setEnableDeleteWarning,
    setBudgetIdToDelete,
    isDeletingBudget: deleteBudgetMutation.isPending,
    isArchivingBudget: archiveBudgetMutation.isPending,
    archiveBudget: handleArchiveBudget,
    closeActionSheet,
    openActionSheet,
  };
};

const useBudgets = () => {
  const { data: budgetsData } = useGetBudgetsQuery();
  const subcategories = useSubcategories();

  const rawBudgets = useMemo(() => {
    if (!budgetsData) return [];
    // Handle both ApiEnvelope and direct array responses
    if (Array.isArray(budgetsData)) {
      return budgetsData;
    }
    if (
      budgetsData &&
      typeof budgetsData === "object" &&
      "data" in budgetsData
    ) {
      return (budgetsData as any).data || [];
    }
    return [];
  }, [budgetsData]);

  const budgets = useMemo(() => {
    if (!Array.isArray(rawBudgets) || rawBudgets.length === 0) {
      return [];
    }
    // Transform BudgetListItem[] to Budget[] format for transformBudgets
    const budgetsAsBudget = rawBudgets.map((item) => ({
      _id: item._id,
      category: item.category,
      Limit: item.Limit,
      totalSpent: item.totalSpent,
      remaining: item.remaining,
      status: item.status,
    })) as BudgetListItem[];
    return transformBudgets(budgetsAsBudget, subcategories || []);
  }, [rawBudgets, subcategories]);

  return { rawBudgets, budgets };
};

const useBudgetSummary = (rawBudgets: BudgetListItem[]) => {
  const { totalBudget, totalSpent } = useMemo(() => {
    if (!Array.isArray(rawBudgets) || rawBudgets.length === 0) {
      return { totalBudget: 0, totalSpent: 0 };
    }

    const total = rawBudgets.reduce(
      (sum, budget) => sum + (budget.Limit || 0),
      0,
    );
    const spent = rawBudgets.reduce(
      (sum, budget) => sum + (budget.totalSpent || 0),
      0,
    );

    return { totalBudget: total, totalSpent: spent };
  }, [rawBudgets]);

  const remaining = Math.max(totalBudget - totalSpent, 0);
  const percentUsed =
    totalBudget <= 0
      ? 0
      : Math.min(Math.round((totalSpent / totalBudget) * 100), 100);
  const formattedRemaining = formatCurrency(remaining);

  return {
    totalBudget,
    totalSpent,
    remaining,
    percentUsed,
    formattedRemaining,
  };
};

const useBudgetRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refetch: refetchBudgets } = useGetBudgetsQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchBudgets();
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, handleRefresh };
};

const BudgetScreen = () => {
  const { isLoading: isLoadingBudgets } = useGetBudgetsQuery();
  const { rawBudgets, budgets } = useBudgets();
  const budgetSummary = useBudgetSummary(rawBudgets);
  const { isRefreshing, handleRefresh } = useBudgetRefresh();
  const budgetActions = useBudgetActions();

  return (
    <MainContainer edges={[]} className="pb-0">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="bg-purpleLight px-6 py-6">
          <View className="flex-row items-center justify-between">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full">
              <Ionicons
                name="chevron-back"
                size={20}
                color={COLORS.textColor}
              />
            </Pressable>
            <Pressable className=" flex-row items-center gap-2">
              <Text weight="semibold" className="text-base text-textColor">
                September 2025
              </Text>
              <Image
                source={require("@/assets/icons/calendar.svg")}
                style={{ width: 20, height: 20 }}
              />
            </Pressable>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full">
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textColor}
              />
            </Pressable>
          </View>

          <View className="mt-6">
            <View className="items-center justify-center">
              <CircularProgress progress={budgetSummary.percentUsed}>
                <View className="size-36 items-center justify-center rounded-full bg-white">
                  <Text weight="semibold" className="text-3xl">
                    {budgetSummary.percentUsed}%
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
                <Text
                  weight="semibold"
                  className="mt-1 text-base text-textColor"
                >
                  {formatCurrency(budgetSummary.totalBudget)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs uppercase text-textColor/60">
                  Total Spent
                </Text>
                <Text weight="semibold" className="mt-1 text-base text-orange">
                  {formatCurrency(budgetSummary.totalSpent)}
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
                  {budgetSummary.formattedRemaining}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="mt-6 px-6">
          <BudgetExceededAlert />
        </View>

        <View className="mt-6 px-6">
          <Text weight="semibold" className="text-lg text-textColor">
            Budget Category
          </Text>

          {isLoadingBudgets ? (
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
                  budget={budget as BudgetCategory}
                  onMorePress={budgetActions.openActionSheet}
                />
              ))}
            </View>
          )}
        </View>

        <SmartBudgetTips />
      </ScrollView>

      <BudgetActionSheet
        visible={budgetActions.isActionSheetOpen}
        onClose={budgetActions.closeActionSheet}
        actions={budgetActions.actions}
        onActionPress={(action) => action.action()}
      />

      <DeleteBudgetModal
        visible={budgetActions.enableDeleteWarning}
        onClose={() => {
          budgetActions.setEnableDeleteWarning(false);
          budgetActions.setBudgetIdToDelete(null);
        }}
        onConfirm={budgetActions.deleteBudget}
        budgetName={budgetActions.activeCategory?.label}
        isDeleting={budgetActions.isDeletingBudget}
      />
    </MainContainer>
  );
};

export default BudgetScreen;
