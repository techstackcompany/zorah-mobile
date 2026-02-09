import { capitalizeWord, generateColorsFromString } from "@/lib/utils";
import { CategoryItem } from "@/src/api/types";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image, ImageSource } from "expo-image";
import React from "react";
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

export type ExpoIconSource = {
  type: "expo-icon";
  library:
    | "Ionicons"
    | "MaterialIcons"
    | "FontAwesome"
    | "MaterialCommunityIcons";
  name: string;
};

export type CategoryIconSource = string | ImageSource | ExpoIconSource;

const CATEGORY_ICON_MAP: Record<string, ExpoIconSource> = {
  food: { type: "expo-icon", library: "Ionicons", name: "fast-food" },
  lunch: { type: "expo-icon", library: "Ionicons", name: "restaurant" },
  dinner: { type: "expo-icon", library: "Ionicons", name: "restaurant" },
  breakfast: { type: "expo-icon", library: "Ionicons", name: "cafe" },
  groceries: { type: "expo-icon", library: "Ionicons", name: "cart" },
  transport: { type: "expo-icon", library: "Ionicons", name: "car" },
  fuel: { type: "expo-icon", library: "Ionicons", name: "car" },
  airtime: { type: "expo-icon", library: "Ionicons", name: "call" },
  data: { type: "expo-icon", library: "Ionicons", name: "wifi" },
  subscription: {
    type: "expo-icon",
    library: "MaterialIcons",
    name: "subscriptions",
  },
  entertainment: {
    type: "expo-icon",
    library: "Ionicons",
    name: "game-controller",
  },
  shopping: { type: "expo-icon", library: "Ionicons", name: "bag" },
  health: { type: "expo-icon", library: "Ionicons", name: "medical" },
  education: { type: "expo-icon", library: "Ionicons", name: "school" },
  utilities: { type: "expo-icon", library: "Ionicons", name: "flash" },
  rent: { type: "expo-icon", library: "Ionicons", name: "home" },
  housing: { type: "expo-icon", library: "Ionicons", name: "home" },
  savings: { type: "expo-icon", library: "Ionicons", name: "wallet" },
  savings_contribution: {
    type: "expo-icon",
    library: "Ionicons",
    name: "wallet",
  },
  deposit: {
    type: "expo-icon",
    library: "Ionicons",
    name: "arrow-down-circle",
  },
  withdrawal: {
    type: "expo-icon",
    library: "Ionicons",
    name: "arrow-up-circle",
  },
  transfer: { type: "expo-icon", library: "Ionicons", name: "swap-horizontal" },
  salary: { type: "expo-icon", library: "Ionicons", name: "cash" },
  income: { type: "expo-icon", library: "Ionicons", name: "trending-up" },
  expense: { type: "expo-icon", library: "Ionicons", name: "trending-down" },
  other: {
    type: "expo-icon",
    library: "Ionicons",
    name: "ellipsis-horizontal-circle",
  },
};

const getMatchingCategoryIconSource = (
  categories: CategoryItem[],
  categoryLabels: string[],
  fallbackIconSource?: string | ImageSource,
): CategoryIconSource => {
  const nameTokens = categoryLabels
    .map((label) => label.toLowerCase().split(/[\s+, _ - / & ()]/))
    .filter(Boolean)
    .flat();

  const match = categories.find(({ label }) => {
    const labelTokens = label
      .toLowerCase()
      .split(/[\s+, _ - / & ()]/)
      .filter(Boolean);
    return (
      labelTokens.some((token) => nameTokens.includes(token)) ||
      nameTokens.includes(label.toLowerCase())
    );
  });

  if (match?.icon) {
    return match.icon;
  }

  if (fallbackIconSource) {
    return fallbackIconSource;
  }

  for (const token of nameTokens) {
    if (CATEGORY_ICON_MAP[token]) {
      return CATEGORY_ICON_MAP[token];
    }
  }

  return CATEGORY_ICON_MAP.other;
};

export const isExpoIconSource = (
  source: CategoryIconSource,
): source is ExpoIconSource => {
  return (
    typeof source === "object" &&
    "type" in source &&
    source.type === "expo-icon"
  );
};

export const renderCategoryIcon = (
  source: CategoryIconSource,
  size: number,
  color: string,
): React.ReactNode => {
  if (isExpoIconSource(source)) {
    const iconProps = { name: source.name as any, size, color };
    switch (source.library) {
      case "Ionicons":
        return <Ionicons {...iconProps} />;
      case "MaterialIcons":
        return <MaterialIcons {...iconProps} />;
      case "FontAwesome":
        return <FontAwesome {...iconProps} />;
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons {...iconProps} />;
      default:
        return (
          <Ionicons
            name="ellipsis-horizontal-circle"
            size={size}
            color={color}
          />
        );
    }
  }

  const uri = typeof source === "string" ? source : (source as ImageSource).uri;
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      tintColor={color}
    />
  );
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
        const iconSource = getMatchingCategoryIconSource(categoryIconsData, [
          categoryName,
        ]);
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
