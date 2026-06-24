import { ImageSource } from "expo-image";
import COLORS from "./colors";

type SummaryCard = {
  id: string;
  label: string;
  amount: string;
  icon: ImageSource;
  accent: string;
  onPress: () => void;
};

type QuickAction = {
  id: string;
  label?: string;
  icon: ImageSource;
  background: string;
  aspectRatio?: 1;
  iconTintColor?: string;
};

type FeatureGridItem = {
  id: string;
  label: string;
  icon: ImageSource;
  iconBackground: string;
  iconTint?: string;
};

const quickActions: QuickAction[] = [
  {
    id: "fund-wallet",
    label: "Fund Wallet",
    icon: require("@/assets/icons/credit-card.svg"),
    background: "bg-white",
    iconTintColor: COLORS.primary_400,
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: require("@/assets/icons/transfer.svg"),
    background: "bg-white",
  },
  {
    id: "goals",
    label: "Set Goals",
    icon: require("@/assets/icons/piggy.svg"),
    background: "bg-white",
  },
];

// I need to find an appropriate place for ai assistance

const featureGridItems: FeatureGridItem[] = [
  {
    id: "track-expense",
    label: "Track Expense",
    icon: require("@/assets/icons/track-spending.svg"),
    iconBackground: "#EFFFF3",
    iconTint: "#32A34D",
  },

  {
    id: "bill-reminders",
    label: "Bill Reminders",
    icon: require("@/assets/icons/bill-reminder.svg"),
    iconBackground: "#FDF3FF",
    iconTint: "#902AA2",
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: require("@/assets/icons/ai_bot.svg"),
    iconBackground: "#FFF5DD",
    iconTint: "#D59007",
  },
];

export { featureGridItems, quickActions };
export type { FeatureGridItem, QuickAction, SummaryCard };
