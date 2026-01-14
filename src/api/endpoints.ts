export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface EndpointConfig {
  method: HttpMethod;
  path: string;
  isExternal?: boolean;
}

export const API_ENDPOINTS = {
  auth: {
    register: { method: HttpMethod.POST, url: "/auth/register" },
    login: { method: HttpMethod.POST, url: "/auth/login" },
    profile: { method: HttpMethod.GET, url: "/auth/profile" },
    setPin: { method: HttpMethod.POST, url: "/auth/set-pin" },
    verifyPin: { method: HttpMethod.POST, url: "/auth/verify-pin" },
    toggleBiometrics: {
      method: HttpMethod.POST,
      url: "/auth/toggle-biometrics",
    },
    requestPasswordReset: {
      method: HttpMethod.POST,
      url: "/auth/request-reset",
    },
    resetPassword: { method: HttpMethod.POST, url: "/auth/reset-password" },
    refreshToken: { method: HttpMethod.POST, url: "/auth/refresh-token" },
  },
  expenses: {
    addExpense: { method: HttpMethod.POST, url: "/expenses/add-expense" },
    getExpenses: { method: HttpMethod.GET, url: "/expenses/get-expense" },
    voiceLogExpense: { method: HttpMethod.POST, url: "/voice/log-expense" },
    getExpense: (expenseId: string) => ({
      method: HttpMethod.GET,
      url: `/expenses/${expenseId}`,
    }),
    updateExpense: (expenseId: string) => ({
      method: HttpMethod.PATCH,
      url: `/expenses/${expenseId}`,
    }),
    deleteExpense: (expenseId: string) => ({
      method: HttpMethod.DELETE,
      url: `/expenses/${expenseId}`,
    }),
    summary: { method: HttpMethod.GET, url: "/expenses/summary" },
    daily: { method: HttpMethod.GET, url: "/expenses/daily" },
    monthly: { method: HttpMethod.GET, url: "/expenses/monthly" },
    spendingOverview: (timeframe: string) => ({
      method: HttpMethod.GET,
      url: `/expenses/spending-overview?timeframe=${timeframe}`,
    }),
  },
  income: {
    addIncome: { method: HttpMethod.POST, url: "/income/add-income" },
    getIncomes: { method: HttpMethod.GET, url: "/income/get-income" },
    getIncome: (incomeId: string) => ({
      method: HttpMethod.GET,
      url: `/income/${incomeId}`,
    }),
    deleteIncome: (incomeId: string) => ({
      method: HttpMethod.DELETE,
      url: `/income/${incomeId}`,
    }),
    editIncome: (incomeId: string) => ({
      method: HttpMethod.PUT,
      url: `/income/${incomeId}`,
    }),
  },
  budgets: {
    createBudget: { method: HttpMethod.POST, url: "/budgets" },
    getBudgets: { method: HttpMethod.GET, url: "/budgets/get-budgets" },
    getBudget: (budgetId: string) => ({
      method: HttpMethod.GET,
      url: `/budgets/${budgetId}`,
    }),
    updateBudget: (budgetId: string) => ({
      method: HttpMethod.PATCH,
      url: `/budgets/${budgetId}`,
    }),
    deleteBudget: (budgetId: string) => ({
      method: HttpMethod.DELETE,
      url: `/budgets/${budgetId}`,
    }),
    archiveBudget: (budgetId: string) => ({
      method: HttpMethod.PATCH,
      url: `/budgets/${budgetId}/archive`,
    }),
    restoreBudget: (budgetId: string) => ({
      method: HttpMethod.PATCH,
      url: `/budgets/${budgetId}/restore`,
    }),
    getArchivedBudgets: {
      method: HttpMethod.GET,
      url: "/budgets/archived",
    },
  },
  notifications: {
    getNotifications: {
      method: HttpMethod.GET,
      url: "/notifications/get-not",
    },
    readNotification: (notificationId: string) => ({
      method: HttpMethod.PATCH,
      url: `/notifications/${notificationId}/read`,
    }),
    registerToken: {
      method: HttpMethod.POST,
      url: "/notifications/register-token",
    },
  },
  savings: {
    createGoal: { method: HttpMethod.POST, url: "/savings/create" },
    contribute: { method: HttpMethod.POST, url: "/savings/contribute" },
    getGoals: { method: HttpMethod.GET, url: "/savings/get-goals" },
    getGoal: (goalId: string) => ({
      method: HttpMethod.GET,
      url: `/savings/${goalId}`,
    }),
    updateGoal: (goalId: string) => ({
      method: HttpMethod.PUT,
      url: `/savings/${goalId}`,
    }),
  },
  wallet: {
    getOrCreate: { method: HttpMethod.GET, url: "/wallet/create" },
    deposit: { method: HttpMethod.POST, url: "/wallet/deposit" },
    withdraw: { method: HttpMethod.POST, url: "/wallet/withdraw" },
    balance: { method: HttpMethod.GET, url: "/wallet/balance" },
    transactions: { method: HttpMethod.GET, url: "/wallet/transactions" },
  },
  categories: {
    getCategories: (type: string) => ({
      method: HttpMethod.GET,
      url: `/categories?type=${type}`,
    }),
  },

  financialTips: {
    getFinancialTips: { method: HttpMethod.GET, url: "/tips" },
  },
  fx: {
    rates: { method: HttpMethod.GET, url: "/fx/rates" },
    pair: { method: HttpMethod.GET, url: "/fx/pair" },
    pairs: { method: HttpMethod.GET, url: "/fx/pairs" },
    history: { method: HttpMethod.GET, url: "/fx/history" },
  },
  kyc: {
    submit: { method: HttpMethod.POST, url: "/kyc/submit" },
  },
  ai: {
    ask: { method: HttpMethod.POST, url: "/ai/ask" },
  },

  billReminders: {
    addBill: { method: HttpMethod.POST, url: "/bills/add-bill" },
    getBills: {
      method: HttpMethod.GET,
      url: "/bills",
    },
    payBill: (id: string) => ({
      method: HttpMethod.PATCH,
      url: `/bills/${id}/pay`,
    }),
  },
  countries: {
    nigerianStates: {
      method: HttpMethod.POST,
      url: "/countries/states",
    },
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
