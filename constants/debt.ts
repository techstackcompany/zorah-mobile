import COLORS from "@/constants/colors";

export type DebtStatus = "outstanding" | "overdue" | "settled";
export type DebtType = "borrowed" | "lent";

export type DebtRecord = {
  id: string;
  name: string;
  phone: string;
  amount: number;
  type: DebtType;
  status: DebtStatus;
  date: string;
  dueDate: string;
  note: string;
};

export const DEBT_STATUS_META: Record<
  DebtStatus,
  { label: string; textColor: string; background: string; border?: string }
> = {
  outstanding: {
    label: "Outstanding",
    textColor: "#C47F0E",
    background: "#FFF5DD",
    border: "rgba(196, 127, 14, 0.25)",
  },
  overdue: {
    label: "Overdue",
    textColor: "#D83A56",
    background: "#FFE6EA",
    border: "rgba(216, 58, 86, 0.25)",
  },
  settled: {
    label: "Settled",
    textColor: COLORS.secondary_500,
    background: COLORS.secondary_150,
    border: "rgba(50, 163, 77, 0.25)",
  },
};

export const DEBT_TYPE_META: Record<
  DebtType,
  { label: string; subLabel: string; background: string; textColor: string }
> = {
  borrowed: {
    label: "You Borrowed",
    subLabel: "You borrowed",
    background: "#E7F7F0",
    textColor: "#2FA89A",
  },
  lent: {
    label: "You Lent",
    subLabel: "You lent",
    background: "#FFE9DD",
    textColor: "#E9781A",
  },
};

export const MOCK_DEBTS: DebtRecord[] = [
  {
    id: "1",
    name: "David Johnson",
    phone: "+234 802 345 6789",
    amount: 21456,
    type: "lent",
    status: "outstanding",
    date: "2025-04-28",
    dueDate: "2025-05-30",
    note: "Lent to cover rent balance.",
  },
  {
    id: "2",
    name: "Sarah Williams",
    phone: "+234 805 123 4567",
    amount: 21456,
    type: "lent",
    status: "overdue",
    date: "2025-04-28",
    dueDate: "2025-05-30",
    note: "Money lent for business supplies.",
  },
  {
    id: "3",
    name: "Michael Brown",
    phone: "+234 806 987 6543",
    amount: 21456,
    type: "borrowed",
    status: "outstanding",
    date: "2025-04-28",
    dueDate: "2025-05-30",
    note: "Borrowed for travel expenses.",
  },
  {
    id: "4",
    name: "Wale Adams",
    phone: "+234 817 765 4321",
    amount: 21456,
    type: "lent",
    status: "settled",
    date: "2025-04-28",
    dueDate: "2025-05-30",
    note: "Short-term loan for groceries.",
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);

