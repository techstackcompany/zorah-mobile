import {
  DebtDateRangeFilter,
  DebtFilters,
  DebtRecord,
  DebtStatusFilter,
  DebtTabId,
} from "./types";

export function filterDebtsByTab(
  debts: DebtRecord[],
  tab: DebtTabId,
): DebtRecord[] {
  if (tab === "all") return debts;
  if (tab === "borrowed") return debts.filter((d) => d.direction === "borrowed");
  return debts.filter((d) => d.direction === "lent");
}

export function filterDebtsBySearch(
  debts: DebtRecord[],
  query: string,
): DebtRecord[] {
  if (!query.trim()) return debts;
  const lower = query.toLowerCase().trim();
  return debts.filter((d) =>
    d.counterpartyName.toLowerCase().includes(lower),
  );
}

function parseDate(dateStr: string): Date {
  // Expects DD/MM/YYYY
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function filterDebtsByStatus(
  debts: DebtRecord[],
  status: DebtStatusFilter,
): DebtRecord[] {
  if (status === "all") return debts;
  return debts.filter((d) => d.status === status);
}

export function filterDebtsByDateRange(
  debts: DebtRecord[],
  range: DebtDateRangeFilter,
): DebtRecord[] {
  if (range === "all" || range === "custom") return debts;

  const now = new Date();
  const today = startOfDay(now);

  return debts.filter((d) => {
    const debtDate = startOfDay(parseDate(d.date));
    if (range === "today") {
      return debtDate.getTime() === today.getTime();
    }
    if (range === "this-week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return debtDate >= weekStart && debtDate <= today;
    }
    if (range === "last-week") {
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      return debtDate >= lastWeekStart && debtDate < thisWeekStart;
    }
    if (range === "this-month") {
      return (
        debtDate.getMonth() === today.getMonth() &&
        debtDate.getFullYear() === today.getFullYear()
      );
    }
    if (range === "last-month") {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return (
        debtDate.getMonth() === lastMonth.getMonth() &&
        debtDate.getFullYear() === lastMonth.getFullYear()
      );
    }
    return true;
  });
}

export function applyAllFilters(
  debts: DebtRecord[],
  tab: DebtTabId,
  search: string,
  filters: DebtFilters,
): DebtRecord[] {
  let result = filterDebtsByTab(debts, tab);
  result = filterDebtsBySearch(result, search);
  result = filterDebtsByStatus(result, filters.status);
  result = filterDebtsByDateRange(result, filters.dateRange);
  return result;
}

export function computeTotals(debts: DebtRecord[]): {
  totalBorrowed: number;
  totalLent: number;
} {
  return debts.reduce(
    (acc, d) => {
      if (d.direction === "borrowed") {
        acc.totalBorrowed += d.amount;
      } else {
        acc.totalLent += d.amount;
      }
      return acc;
    },
    { totalBorrowed: 0, totalLent: 0 },
  );
}
