import { BudgetCategory } from "@/components/budget/BudgetCard";
import { formatCurrency } from "@/lib/utils";
import {
  useArchiveBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetsQuery,
  useGetCategoriesQuery,
} from "@/src/api/hooks";
import { BudgetListItem } from "@/src/api/types";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ImageSource } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

export type BudgetPeriod = {
  month: number;
  year: number;
};

export const getBudgetStatus = (
  spent: number,
  allocated: number,
): "on-track" | "approaching" | "exceeded" => {
  const remaining = allocated - spent;
  if (remaining <= 0) return "exceeded";
  if (allocated > 0 && remaining < allocated * 0.1) return "approaching";
  return "on-track";
};

export const transformBudgets = (
  budgetsData: BudgetListItem[],
  subcategories: { key: string; label: string; icon: string }[],
) => {
  return budgetsData.map((budget: BudgetListItem) => {
    const spent = budget.totalSpent ?? budget.spent ?? 0;
    const allocated = budget.Limit ?? budget.amount ?? 0;
    const remaining = budget.remaining ?? Math.max(allocated - spent, 0);
    const subcategoryIcon = subcategories?.find(
      (subcategory) => subcategory.key === budget.category,
    )?.icon;
    const iconSource: ImageSource = subcategoryIcon
      ? { uri: subcategoryIcon }
      : {};

    let status: "on-track" | "approaching" | "exceeded";
    const statusLabel =
      budget.status ||
      (remaining <= 0
        ? "over budget 🚨"
        : remaining < allocated * 0.1
          ? "Almost reached ⛔️"
          : "On track ✅");

    const statusLower = statusLabel.toLowerCase();
    if (
      statusLower.includes("exceeded") ||
      statusLower.includes("over budget") ||
      statusLower.includes("over")
    ) {
      status = "exceeded";
    } else if (
      statusLower.includes("almost reached") ||
      statusLower.includes("approaching") ||
      statusLower.includes("warning")
    ) {
      status = "approaching";
    } else {
      status = getBudgetStatus(spent, allocated);
    }

    return {
      id: budget?._id,
      label: budget.category || "Unknown",
      icon: iconSource,
      allocated,
      spent,
      remaining,
      status,
    };
  });
};

export const getBudgetPeriod = (budget: BudgetListItem): BudgetPeriod | null => {
  if (budget.month && budget.year) {
    return { month: budget.month, year: budget.year };
  }

  const dateString = budget.startDate || budget.createdAt;
  if (!dateString) {
    return null;
  }

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return {
    month: parsedDate.getMonth() + 1,
    year: parsedDate.getFullYear(),
  };
};

export const useSubcategories = () => {
  const { data: subcategoriesData } = useGetCategoriesQuery("budget");
  return subcategoriesData?.data?.subcategories.map((subcategory) => ({
    key: subcategory.name,
    label: subcategory.name,
    icon: subcategory.image || "",
  }));
};

export const useBudgetActions = () => {
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

  useEffect(() => {
    if (budgetIdToArchive && !archiveBudgetMutation.isPending) {
      archiveBudgetMutation.mutate();
    }
  }, [archiveBudgetMutation, budgetIdToArchive]);

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

export const useBudgets = (selectedPeriod?: BudgetPeriod) => {
  const { data: budgetsData } = useGetBudgetsQuery();
  const subcategories = useSubcategories();

  const rawBudgets = useMemo<BudgetListItem[]>(() => {
    if (!budgetsData) return [];
    if (Array.isArray(budgetsData)) {
      return budgetsData;
    }
    if (
      budgetsData &&
      typeof budgetsData === "object" &&
      "data" in budgetsData
    ) {
      const data = (budgetsData as any).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [budgetsData]);

  const filteredRawBudgets = useMemo(() => {
    if (!selectedPeriod) return rawBudgets;

    return rawBudgets.filter((budget) => {
      const period = getBudgetPeriod(budget);
      if (!period) return true;
      return (
        period.month === selectedPeriod.month &&
        period.year === selectedPeriod.year
      );
    });
  }, [rawBudgets, selectedPeriod]);

  const budgets = useMemo(() => {
    if (!Array.isArray(filteredRawBudgets) || filteredRawBudgets.length === 0) {
      return [];
    }

    return transformBudgets(filteredRawBudgets, subcategories || []);
  }, [filteredRawBudgets, subcategories]);

  return { rawBudgets, budgets, filteredRawBudgets };
};

export const useBudgetSummary = (rawBudgets: BudgetListItem[]) => {
  const { totalBudget, totalSpent } = useMemo(() => {
    if (!Array.isArray(rawBudgets) || rawBudgets.length === 0) {
      return { totalBudget: 0, totalSpent: 0 };
    }

    const total = rawBudgets.reduce(
      (sum, budget) => sum + (budget.Limit ?? budget.amount ?? 0),
      0,
    );
    const spent = rawBudgets.reduce(
      (sum, budget) => sum + (budget.totalSpent ?? budget.spent ?? 0),
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

export const useBudgetRefresh = () => {
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
