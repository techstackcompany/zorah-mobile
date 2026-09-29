export type DebtDirection = "borrowed" | "lent";

export type DebtStatus = "outstanding" | "overdue" | "settled";

export type DebtRecord = {
  id: string;
  counterpartyName: string;
  counterpartyPhone: string;
  direction: DebtDirection;
  amount: number; // in naira, e.g. 21456.00
  date: string; // DD/MM/YYYY
  dueDate: string; // DD/MM/YYYY
  notes?: string;
  status: DebtStatus;
};

export type DebtTabId = "all" | "borrowed" | "lent";

export type DebtStatusFilter = "all" | "outstanding" | "overdue" | "settled";

export type DebtDateRangeFilter =
  | "all"
  | "today"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "custom";

export type DebtFilters = {
  status: DebtStatusFilter;
  dateRange: DebtDateRangeFilter;
};
