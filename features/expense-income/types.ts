import { Ionicons } from "@expo/vector-icons";

 export type ChartSegment = {
  key: string;
  label: string;
  percentage: number;
  color: string;
  trackColor: string;
  icon: keyof typeof Ionicons.glyphMap;
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
  id?: string;
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