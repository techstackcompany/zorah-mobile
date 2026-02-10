import {
  CategoryIconSource,
  getMatchingCategoryIconSource,
} from "@/features/expense-income/utils";
import { BudgetListItem, CategoryItem } from "@/src/api/types";
import { BudgetPeriod } from "./types";

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
  const categoryItems: CategoryItem[] = subcategories.map((sub) => ({
    key: sub.key,
    label: sub.label,
    icon: sub.icon,
  }));

  return budgetsData.map((budget: BudgetListItem) => {
    const spent = budget.totalSpent ?? budget.spent ?? 0;
    const allocated = budget.Limit ?? budget.amount ?? 0;
    const remaining = budget.remaining ?? Math.max(allocated - spent, 0);

    const categoryName = budget.category || "Other";
    const iconSource: CategoryIconSource = getMatchingCategoryIconSource(
      categoryItems,
      [categoryName],
    );

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
      label: categoryName,
      icon: iconSource,
      allocated,
      spent,
      remaining,
      status,
    };
  });
};

export const getBudgetPeriod = (
  budget: BudgetListItem,
): BudgetPeriod | null => {
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
