import { capitalizeWord, generateColorsFromString } from "@/lib/utils";
import { CategoryItem } from "@/src/api/types";
import { ImageSource } from "expo-image";
import { labelPositions } from "./constants";
import { ChartSegment } from "./types";

export const formatCurrency = (value: number): string => {
  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
  return currencyFormatter.format(value);
};

export const formatExpenseDate = (date: string): string => {
  if (!date) return "";

  try {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const year = dateObj.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    }
  } catch {
    if (date.includes("-") && !date.includes("T")) {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year.slice(-2)}`;
    }
  }

  return "";
};

const getMatchingCategoryIconSource = (
  categories: CategoryItem[],
  categoryName: string,
  fallbackIconSource?: string | ImageSource,
): string | ImageSource => {
  const found = categories.find(
    (cat) => cat.label === categoryName.toLowerCase(),
  )?.icon;
  if (found) return found;
  if (fallbackIconSource) return fallbackIconSource;
  return require("@/assets/icons/category.png");
};

const buildExpenseSummaryFromList = (
  list: any[],
  categoryIconsData: CategoryItem[],
) => {
  if (Array.isArray(list) && list.length > 0) {
    const total = list.reduce((sum, item) => sum + (item.total || 0), 0);

    const segments: ChartSegment[] = list
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .map((item, index) => {
        const categoryName = item.category || "Other";
        const iconSource = getMatchingCategoryIconSource(
          categoryIconsData,
          categoryName,
        );
        console.log("iconSource", iconSource);
        const amount = item.total || 0;
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        const labelPosition =
          labelPositions[index % labelPositions.length] || {};
        const colors = generateColorsFromString(categoryName);
        const categoryColor = colors.accent;

        return {
          key: `${categoryName}-${index}`,
          label: capitalizeWord(categoryName),
          percentage: Math.round(percentage),
          color: categoryColor,
          trackColor: colors.background,
          iconSource,
          iconBackground: colors.background,
          labelPosition,
          amount,
        };
      });

    return { total, segments };
  }
  return { total: 0, segments: [] };
};

export { buildExpenseSummaryFromList, getMatchingCategoryIconSource };
