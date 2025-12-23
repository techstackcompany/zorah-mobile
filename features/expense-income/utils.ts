import { ChartSegment } from "@/components/expense-planning";
import { Ionicons } from "@expo/vector-icons";

export const CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> =
  {
    Food: "fast-food-outline",
    Transport: "bus-outline",
    Calls: "call-outline",
    "POS Charges": "card-outline",
    Data: "wifi-outline",
    investment: "trending-up-outline",
    gift: "gift-outline",
    salary: "cash-outline",
    business: "business-outline",
    freelance: "briefcase-outline",
    other: "ellipse-outline",
  };

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  Food: "#5D5FFE",
  Transport: "#FDBA4D",
  Calls: "#3EB489",
  "POS Charges": "#1A43BE",
  Data: "#E261F3",
  investment: "#27AE60",
  gift: "#E261F3",
  salary: "#5D5FFE",
  business: "#FDBA4D",
  freelance: "#3EB489",
  other: "#7E8DA0",
};

export const CATEGORY_TRACK_COLOR_MAP: Record<string, string> = {
  Food: "#E6E7FF",
  Transport: "#FFF1DD",
  Calls: "#E5F6F0",
  "POS Charges": "#E9EEFF",
  Data: "#FBE9FF",
  // Income categories
  investment: "#E5F6F0",
  gift: "#FBE9FF",
  salary: "#E6E7FF",
  business: "#FFF1DD",
  freelance: "#E5F6F0",
  other: "#F0F2F5",
};

export const CATEGORY_BG_COLOR_MAP: Record<string, string> = {
  Food: "#F6F5FF",
  Transport: "#FFF7E7",
  Calls: "#E7F8F1",
  "POS Charges": "#E9EEFF",
  Data: "#F9ECFF",
  // Income categories
  investment: "#E7F8F1",
  gift: "#F9ECFF",
  salary: "#F6F5FF",
  business: "#FFF7E7",
  freelance: "#E7F8F1",
  other: "#F5F6F8",
  // Add more mappings as needed
};

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



const getTrackColorForCategory = (cat: string, color: string): string => {
  if (CATEGORY_TRACK_COLOR_MAP[cat]) return CATEGORY_TRACK_COLOR_MAP[cat];
  const trackColors: Record<string, string> = {
    "#5D5FFE": "#E6E7FF",
    "#FDBA4D": "#FFF1DD",
    "#3EB489": "#E5F6F0",
    "#1A43BE": "#E9EEFF",
    "#E261F3": "#FBE9FF",
    "#27AE60": "#E5F6F0",
    "#F2994A": "#FFF1DD",
    "#BB6BD9": "#FBE9FF",
    "#9B51E0": "#F9ECFF",
    "#7E8DA0": "#F0F2F5",
  };
  return trackColors[color] || "#E6E7FF";
}

const getBgColorForCategory = (cat: string, color: string): string => {
  if (CATEGORY_BG_COLOR_MAP[cat]) return CATEGORY_BG_COLOR_MAP[cat];
  const bgColors: Record<string, string> = {
    "#5D5FFE": "#F6F5FF",
    "#FDBA4D": "#FFF7E7",
    "#3EB489": "#E7F8F1",
    "#1A43BE": "#E9EEFF",
    "#E261F3": "#F9ECFF",
    "#27AE60": "#E7F8F1",
    "#F2994A": "#FFF7E7",
    "#BB6BD9": "#F9ECFF",
    "#9B51E0": "#F9ECFF",
    "#7E8DA0": "#F5F6F8",
  };
  return bgColors[color] || "#F6F5FF";
};


   const getColorForCategory = (cat: string, idx: number): string => {
              if (CATEGORY_COLOR_MAP[cat]) return CATEGORY_COLOR_MAP[cat];
              const colors = [
                "#5D5FFE",
                "#FDBA4D",
                "#3EB489",
                "#1A43BE",
                "#E261F3",
                "#27AE60",
                "#F2994A",
                "#BB6BD9",
                "#9B51E0",
                "#7E8DA0",
              ];
              return colors[idx % colors.length];
            };

const buildExpenseSummaryFromList = (
  list: any[],
): { total: number; segments: ChartSegment[] } => {
  if (!list || list.length === 0) return { total: 0, segments: [] };

  const categoryMap = new Map<string, number>();
  let total = 0;

  list.forEach((item) => {
    const category = item.category || "Other";
    const amount = Math.abs(item.amount || 0);
    total += amount;
    categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
  });

  const labelPositions = [
    { bottom: 36, left: 24 },
    { top: 42, right: 36 },
    { top: 62, left: 26 },
    { bottom: 58, right: 26 },
  ];

  const segments: ChartSegment[] = Array.from(categoryMap.entries()).map(
    ([categoryName, amount], index) => {
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      const labelPosition = labelPositions[index % labelPositions.length] || {};

      return {
        key: `${categoryName}-${index}`,
        label: categoryName,
        percentage: Math.round(percentage),
        color: CATEGORY_COLOR_MAP[categoryName] || "#5D5FFE",
        trackColor: CATEGORY_TRACK_COLOR_MAP[categoryName] || "#E6E7FF",
        icon: CATEGORY_ICON_MAP[categoryName] || "cash-outline",
        iconBackground: CATEGORY_BG_COLOR_MAP[categoryName] || "#F6F5FF",
        labelPosition,
        amount,
      };
    },
  );

  return { total, segments };
};

export {
  buildExpenseSummaryFromList,
  getBgColorForCategory,
  getTrackColorForCategory,
  getColorForCategory
};
