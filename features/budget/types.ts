import { BudgetListItem } from "@/src/api/types";
import { ImageSource } from "expo-image";

export type BudgetCategory = {
  id: string;
  label: string;
  icon: ImageSource;
  allocated: number;
  spent: number;
  remaining?: number;
  status: "on-track" | "approaching" | "exceeded";
};

export type BudgetPeriod = {
  month: number;
  year: number;
};

export type { BudgetListItem };
