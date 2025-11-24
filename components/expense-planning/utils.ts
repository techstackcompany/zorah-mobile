import { Ionicons } from "@expo/vector-icons";

// Map API category names to UI category keys
export const CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> =
  {
    Food: "fast-food-outline",
    Transport: "bus-outline",
    Calls: "call-outline",
    "POS Charges": "card-outline",
    Data: "wifi-outline",
    // Income categories
    investment: "trending-up-outline",
    gift: "gift-outline",
    salary: "cash-outline",
    business: "business-outline",
    freelance: "briefcase-outline",
    other: "ellipse-outline",
    // Add more mappings as needed
  };

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  Food: "#5D5FFE",
  Transport: "#FDBA4D",
  Calls: "#3EB489",
  "POS Charges": "#1A43BE",
  Data: "#E261F3",
  // Income categories
  investment: "#27AE60",
  gift: "#E261F3",
  salary: "#5D5FFE",
  business: "#FDBA4D",
  freelance: "#3EB489",
  other: "#7E8DA0",
  // Add more mappings as needed
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
  // Add more mappings as needed
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
    // Fallback: try to parse if it's already in YYYY-MM-DD format
    if (date.includes("-") && !date.includes("T")) {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year.slice(-2)}`;
    }
  }

  return "";
};
