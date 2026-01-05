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
    register: { method: HttpMethod.POST, path: "/auth/register" },
    login: { method: HttpMethod.POST, path: "/auth/login" },
    profile: { method: HttpMethod.GET, path: "/auth/profile" },
    setPin: { method: HttpMethod.POST, path: "/auth/set-pin" },
    verifyPin: { method: HttpMethod.POST, path: "/auth/verify-pin" },
    toggleBiometrics: {
      method: HttpMethod.POST,
      path: "/auth/toggle-biometrics",
    },
    requestPasswordReset: {
      method: HttpMethod.POST,
      path: "/auth/request-reset",
    },
    resetPassword: { method: HttpMethod.POST, path: "/auth/reset-password" },
    refreshToken: { method: HttpMethod.POST, path: "/auth/refresh-token" },
  },
  expenses: {
    addExpense: { method: HttpMethod.POST, path: "/expenses/add-expense" },
    getExpenses: { method: HttpMethod.GET, path: "/expenses/get-expense" },
    voiceLogExpense: { method: HttpMethod.POST, path: "/voice/log-expense" },
    getExpense: (expenseId: string) => ({
      method: HttpMethod.GET,
      path: `/expenses/${expenseId}`,
    }),
    updateExpense: (expenseId: string) => ({
      method: HttpMethod.PATCH,
      path: `/expenses/${expenseId}`,
    }),
    deleteExpense: (expenseId: string) => ({
      method: HttpMethod.DELETE,
      path: `/expenses/${expenseId}`,
    }),
    summary: { method: HttpMethod.GET, path: "/expenses/summary" },
    daily: { method: HttpMethod.GET, path: "/expenses/daily" },
    monthly: { method: HttpMethod.GET, path: "/expenses/monthly" },
  },
  income: {
    addIncome: { method: HttpMethod.POST, path: "/income/add-income" },
    getIncomes: { method: HttpMethod.GET, path: "/income/get-income" },
    getIncome: (incomeId: string) => ({
      method: HttpMethod.GET,
      path: `/income/${incomeId}`,
    }),
    deleteIncome: (incomeId: string) => ({
      method: HttpMethod.DELETE,
      path: `/income/${incomeId}`,
    }),
    editIncome: (incomeId: string) => ({
      method: HttpMethod.PUT,
      path: `/income/${incomeId}`,
    }),
  },
  budgets: {
    createBudget: { method: HttpMethod.POST, path: "/budgets" },
    getBudgets: { method: HttpMethod.GET, path: "/budgets/get-budgets" },
    getBudget: (budgetId: string) => ({
      method: HttpMethod.GET,
      path: `/budgets/${budgetId}`,
    }),
    updateBudget: (budgetId: string) => ({
      method: HttpMethod.PATCH,
      path: `/budgets/${budgetId}`,
    }),
    deleteBudget: (budgetId: string) => ({
      method: HttpMethod.DELETE,
      path: `/budgets/${budgetId}`,
    }),
    archiveBudget: (budgetId: string) => ({
      method: HttpMethod.PATCH,
      path: `/budgets/${budgetId}/archive`,
    }),
    restoreBudget: (budgetId: string) => ({
      method: HttpMethod.PATCH,
      path: `/budgets/${budgetId}/restore`,
    }),
    getArchivedBudgets: {
      method: HttpMethod.GET,
      path: "/budgets/archived",
    },
  },
  notifications: {
    getNotifications: {
      method: HttpMethod.GET,
      path: "/notifications/get-not",
    },
    readNotification: (notificationId: string) => ({
      method: HttpMethod.PATCH,
      path: `/notifications/${notificationId}/read`,
    }),
    registerToken: {
      method: HttpMethod.POST,
      path: "/notifications/register-token",
    },
    sendTestNotification: {
      method: HttpMethod.POST,
      path: "https://flashily-unintegrable-holden.ngrok-free.dev/api/notifications/test",
      isExternal: true,
    },
  },
  savings: {
    createGoal: { method: HttpMethod.POST, path: "/savings/create" },
    contribute: { method: HttpMethod.POST, path: "/savings/contribute" },
    getGoals: { method: HttpMethod.GET, path: "/savings/get-goals" },
    getGoal: (goalId: string) => ({
      method: HttpMethod.GET,
      path: `/savings/${goalId}`,
    }),
    updateGoal: (goalId: string) => ({
      method: HttpMethod.PUT,
      path: `/savings/${goalId}`,
    }),
  },
  wallet: {
    getOrCreate: { method: HttpMethod.GET, path: "/wallet/create" },
    deposit: { method: HttpMethod.POST, path: "/wallet/deposit" },
    withdraw: { method: HttpMethod.POST, path: "/wallet/withdraw" },
    balance: { method: HttpMethod.GET, path: "/wallet/balance" },
    transactions: { method: HttpMethod.GET, path: "/wallet/transactions" },
  },
  categories: {
    getCategories: (type: string) => ({
      method: HttpMethod.GET,
      path: `/categories?type=${type}`,
    }),
  },
  fx: {
    rates: { method: HttpMethod.GET, path: "/fx/rates" },
    pair: { method: HttpMethod.GET, path: "/fx/pair" },
    pairs: { method: HttpMethod.GET, path: "/fx/pairs" },
    history: { method: HttpMethod.GET, path: "/fx/history" },
  },
  kyc: {
    submit: { method: HttpMethod.POST, path: "/kyc/submit" },
  },
  ai: {
    ask: { method: HttpMethod.POST, path: "/ai/ask" },
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
