import { Ionicons } from "@expo/vector-icons";
import { CategoryIconSource } from "./utils";

export type ChartSegment = {
  key: string;
  label: string;
  percentage: number;
  color: string;
  trackColor: string;
  iconSource: CategoryIconSource;
  iconBackground: string;
  labelPosition: Partial<Record<"top" | "bottom" | "left" | "right", number>>;
  amount: number;
};
export type PeriodType = "daily" | "monthly";

export type TabKey = "expense" | "income";

export type TabItem = {
  key: TabKey;
  label: string;
};

export type ExpenseItem = {
  _id?: string;
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  paymentMethod?: string;
};
export interface PeriodOption {
  value: PeriodType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export type TabContent = {
  key: TabKey;
  label: string;
  categoryTitle: string;
  breakdownTitle: string;
  rankingTitle: string;
};
