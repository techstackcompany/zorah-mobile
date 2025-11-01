import COLORS from "@/constants/colors";
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

export const SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: "wedding-planning",
    name: "Wedding Planning",
    description: "Traditional and white wedding ceremony",
    currentAmount: 800_456,
    targetAmount: 2_000_000,
    status: "active",
    category: "Celebration",
    targetDate: "2025-12-18",
    accent: "#F7ECFF",
    iconBackground: "#EEE1FF",
    iconColor: COLORS.primary_400,
    icon: "gift-outline",
  },
  {
    id: "house-deposit",
    name: "House Deposit",
    description: "Save for my dream home in Ajah Lekki",
    currentAmount: 125_000,
    targetAmount: 9_650_000,
    status: "active",
    category: "Housing",
    targetDate: "2026-06-01",
    accent: "#EAF2FF",
    iconBackground: "#DDE9FF",
    iconColor: "#2F66F6",
    icon: "home-outline",
  },
  {
    id: "vacation-dubai",
    name: "Vacation to Dubai",
    description: "Money for my vacation destination",
    currentAmount: 101_456,
    targetAmount: 520_950,
    status: "active",
    category: "Travel",
    targetDate: "2025-09-15",
    accent: "#ECFFF4",
    iconBackground: "#DAF7E8",
    iconColor: COLORS.secondary_500,
    icon: "airplane-outline",
  },
  {
    id: "emergency-fund",
    name: "Emergency Fund",
    description: "6 months of medical expenses and other family needs",
    currentAmount: 400_000,
    targetAmount: 400_000,
    status: "completed",
    category: "Safety",
    targetDate: "2025-03-30",
    accent: "#ECFFF0",
    iconBackground: "#DAF3E2",
    iconColor: COLORS.secondary_500,
    icon: "shield-checkmark-outline",
  },
];

export const GOAL_CONTRIBUTIONS: GoalContribution[] = [
  {
    id: "wedding-001",
    goalId: "wedding-planning",
    amount: 50_000,
    source: "Bank Transfer",
    createdAt: "2025-01-10T10:44:00Z",
  },
  {
    id: "wedding-002",
    goalId: "wedding-planning",
    amount: 10_000,
    source: "Bank Transfer",
    createdAt: "2025-01-10T10:44:00Z",
  },
  {
    id: "wedding-003",
    goalId: "wedding-planning",
    amount: 20_000,
    source: "Debit Card",
    createdAt: "2025-01-10T10:44:00Z",
  },
  {
    id: "wedding-004",
    goalId: "wedding-planning",
    amount: 10_000,
    source: "Bank Transfer",
    createdAt: "2025-01-10T10:44:00Z",
  },
  {
    id: "wedding-005",
    goalId: "wedding-planning",
    amount: 15_000,
    source: "Bank Transfer",
    createdAt: "2025-01-10T10:44:00Z",
  },
  {
    id: "vacation-001",
    goalId: "vacation-dubai",
    amount: 25_000,
    source: "Card Payment",
    createdAt: "2025-01-05T09:20:00Z",
  },
];

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
