import COLORS from "@/constants/colors";
import { SavingsGoal as ApiSavingsGoal } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";

export type GoalStatus = "active" | "completed";

export type SavingsGoal = {
  id: string;
  name: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  status: GoalStatus;
  category: string;
  targetDate: string;
  accent: string;
  iconBackground: string;
  iconColor: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type GoalContribution = {
  id: string;
  goalId: string;
  amount: number;
  source: string;
  createdAt: string;
};





export const PAYMENT_SOURCES = [
  {
    id: "bank-transfer",
    label: "Bank Transfer",
    icon: "business-outline",
  },
  {
    id: "card-payment",
    label: "Card Payment",
    icon: "card-outline",
  },
  {
    id: "ussd",
    label: "USSD",
    icon: "keypad-outline",
  },
] as const;

export const getStatusTone = (status: GoalStatus) =>
  status === "completed"
    ? { background: "#E7F7EC", color: COLORS.secondary_500, label: "Completed" }
    : { background: "#E7EEFF", color: COLORS.primary_400, label: "Active" };

export const calculateGoalProgress = (current: number, target: number) =>
  target === 0 ? 0 : Math.min(current / target, 1);

export const mapApiGoalToUiGoal = (
  apiGoal: ApiSavingsGoal,
): SavingsGoal => {
  const getDefaultIcon = (title: string): {
    icon: keyof typeof Ionicons.glyphMap;
    iconBackground: string;
    iconColor: string;
    accent: string;
    category: string;
  } => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("wedding") || lowerTitle.includes("marriage")) {
      return {
        icon: "gift-outline",
        iconBackground: "#EEE1FF",
        iconColor: COLORS.primary_400,
        accent: "#F7ECFF",
        category: "Celebration",
      };
    }
    if (lowerTitle.includes("house") || lowerTitle.includes("home")) {
      return {
        icon: "home-outline",
        iconBackground: "#DDE9FF",
        iconColor: "#2F66F6",
        accent: "#EAF2FF",
        category: "Housing",
      };
    }
    if (
      lowerTitle.includes("vacation") ||
      lowerTitle.includes("travel") ||
      lowerTitle.includes("trip")
    ) {
      return {
        icon: "airplane-outline",
        iconBackground: "#DAF7E8",
        iconColor: COLORS.secondary_500,
        accent: "#ECFFF4",
        category: "Travel",
      };
    }
    if (
      lowerTitle.includes("emergency") ||
      lowerTitle.includes("safety") ||
      lowerTitle.includes("fund")
    ) {
      return {
        icon: "shield-checkmark-outline",
        iconBackground: "#DAF3E2",
        iconColor: COLORS.secondary_500,
        accent: "#ECFFF0",
        category: "Safety",
      };
    }
    if (lowerTitle.includes("education") || lowerTitle.includes("school")) {
      return {
        icon: "school-outline",
        iconBackground: "#FFF1DD",
        iconColor: "#FDBA4D",
        accent: "#FFF7E7",
        category: "Education",
      };
    }
    if (lowerTitle.includes("car") || lowerTitle.includes("vehicle")) {
      return {
        icon: "car-outline",
        iconBackground: "#E6E7FF",
        iconColor: COLORS.primary_400,
        accent: "#F6F5FF",
        category: "Transport",
      };
    }
    // Default
    return {
      icon: "wallet-outline",
      iconBackground: "#E7EEFF",
      iconColor: COLORS.primary_400,
      accent: "#F0F4FF",
      category: "General",
    };
  };

  const defaults = getDefaultIcon(apiGoal.title);
  const goalId = apiGoal._id || apiGoal.id || "";

  // Parse deadline from ISO format to YYYY-MM-DD
  let targetDate = "";
  if (apiGoal.deadline) {
    try {
      targetDate = new Date(apiGoal.deadline).toISOString().split("T")[0];
    } catch {
      // If date parsing fails, use empty string
      targetDate = "";
    }
  }

  return {
    id: goalId,
    name: apiGoal.title,
    description: apiGoal.description || "",
    currentAmount: apiGoal.currentAmount ?? 0,
    targetAmount: apiGoal.targetAmount,
    status: (apiGoal.status === "completed" ? "completed" : "active") as GoalStatus,
    category: defaults.category,
    targetDate,
    accent: defaults.accent,
    iconBackground: defaults.iconBackground,
    iconColor: defaults.iconColor,
    icon: defaults.icon,
  };
};
