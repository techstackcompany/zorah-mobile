import COLORS from "@/constants/colors";

export type TaxStatus = "pending" | "paid";
export type TaxFrequency = "one-time" | "monthly" | "quarterly" | "yearly";
export type TaxIncomeType = "salary" | "freelance" | "business";

export type TaxPayment = {
  id: string;
  amount: number;
  method: string;
  timestamp: string;
};

export type TaxRecord = {
  id: string;
  name: string;
  country: string;
  incomeType: TaxIncomeType;
  filingDate: string;
  frequency: TaxFrequency;
  incomeAmount: number;
  deductions: number;
  taxRate: number;
  taxDue: number;
  status: TaxStatus;
  dueDate: string;
  reminderEnabled: boolean;
  description?: string;
  payments: TaxPayment[];
};

export const TAX_STATUS_META: Record<
  TaxStatus,
  { label: string; textColor: string; background: string; border: string }
> = {
  pending: {
    label: "Pending",
    textColor: "#C47F0E",
    background: "#FFF5DD",
    border: "rgba(196, 127, 14, 0.25)",
  },
  paid: {
    label: "Paid",
    textColor: COLORS.secondary_500,
    background: COLORS.secondary_150,
    border: "rgba(50, 163, 77, 0.25)",
  },
};

export const TAX_COUNTRY_OPTIONS = [
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "canada", label: "Canada" },
  { value: "congo", label: "Congo" },
] as const;

export const TAX_INCOME_TYPE_OPTIONS = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "business", label: "Business" },
] as const;

export const TAX_RATE_BY_INCOME: Record<TaxIncomeType, number> = {
  salary: 0.1,
  freelance: 0.15,
  business: 0.12,
};

export const TAX_FREQUENCY_OPTIONS = [
  { value: "one-time", label: "One-Time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
] as const;

export const TAX_STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
] as const;

export const TAX_DATE_RANGE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "lastWeek", label: "Last week" },
  { value: "month", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
] as const;

export const MOCK_TAX_RECORDS: TaxRecord[] = [
  {
    id: "salary-income-tax",
    name: "Salary Income Tax",
    country: "Nigeria",
    incomeType: "salary",
    filingDate: "2025-08-10",
    frequency: "monthly",
    incomeAmount: 500_000,
    deductions: 55_000,
    taxRate: 0.1,
    taxDue: 45_000,
    status: "pending",
    dueDate: "2025-05-30",
    reminderEnabled: true,
    description: "Monthly salary income tax record.",
    payments: [
      {
        id: "pay-1",
        amount: 45_000,
        method: "Bank Transfer",
        timestamp: "2025-01-10T10:44:00Z",
      },
      {
        id: "pay-2",
        amount: 45_000,
        method: "Bank Transfer",
        timestamp: "2024-12-10T10:44:00Z",
      },
      {
        id: "pay-3",
        amount: 45_000,
        method: "Debit Card",
        timestamp: "2024-11-10T10:44:00Z",
      },
    ],
  },
  {
    id: "business-income-tax",
    name: "Business Income Tax",
    country: "Nigeria",
    incomeType: "business",
    filingDate: "2025-08-10",
    frequency: "monthly",
    incomeAmount: 350_000,
    deductions: 65_000,
    taxRate: 0.12,
    taxDue: 21_456,
    status: "paid",
    dueDate: "2025-05-30",
    reminderEnabled: false,
    description: "Quarterly business income tax for retail operations.",
    payments: [
      {
        id: "pay-4",
        amount: 21_456,
        method: "Bank Transfer",
        timestamp: "2025-01-05T09:12:00Z",
      },
    ],
  },
  {
    id: "other-income-tax",
    name: "Other Tax",
    country: "Nigeria",
    incomeType: "freelance",
    filingDate: "2025-08-10",
    frequency: "monthly",
    incomeAmount: 120_000,
    deductions: 15_000,
    taxRate: 0.08,
    taxDue: 1_690,
    status: "pending",
    dueDate: "2025-05-30",
    reminderEnabled: true,
    description: "Miscellaneous tax obligations.",
    payments: [],
  },
];

export const formatCurrency = (value: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
