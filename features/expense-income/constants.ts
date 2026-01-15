import { Ionicons } from "@expo/vector-icons";
import { PeriodType, TabContent, TabKey } from "./types";

export const PERIOD_OPTIONS: {
  value: PeriodType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "daily", label: "Daily", icon: "calendar-outline" },
  { value: "monthly", label: "Monthly", icon: "calendar-number-outline" },
];

export const EMPTY_STATE_MESSAGES: Record<
  TabKey,
  { title: string; subtitle: string }
> = {
  expense: {
    title: "No expense tracking information",
    subtitle: "All expenses will appear here",
  },
  income: {
    title: "No income tracking information",
    subtitle: "All income will appear here",
  },
};

export const TAB_ITEMS: readonly TabContent[] = [
  {
    key: "expense",
    label: "Expense",
    categoryTitle: "Expense Category",
    breakdownTitle: "Expense Breakdown",
    rankingTitle: "Expense ranking",
  },
  {
    key: "income",
    label: "Income",
    categoryTitle: "Income Category",
    breakdownTitle: "Income Breakdown",
    rankingTitle: "Income ranking",
  },
] as const;

export const labelPositions = [
  { bottom: 36, left: 24 },
  { top: 42, right: 36 },
  { top: 62, left: 26 },
  { bottom: 58, right: 26 },
];
