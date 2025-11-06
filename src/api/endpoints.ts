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

type DynamicEndpoint<TArgs extends unknown[]> = (...args: TArgs) => EndpointConfig;

export const API_ENDPOINTS = {
  auth: {
    register: { method: HttpMethod.POST, path: "/auth/register" },
    login: { method: HttpMethod.POST, path: "/auth/login" },
    profile: { method: HttpMethod.GET, path: "/auth/profile" },
    setPin: { method: HttpMethod.POST, path: "/auth/set-pin" },
    verifyPin: { method: HttpMethod.POST, path: "/auth/verify-pin" },
    toggleBiometrics: { method: HttpMethod.POST, path: "/auth/toggle-biometrics" },
    requestPasswordReset: { method: HttpMethod.POST, path: "/auth/request-reset" },
    resetPassword: { method: HttpMethod.POST, path: "/auth/reset-password" },
    refreshToken: { method: HttpMethod.POST, path: "/auth/refresh-token" },
  },
  expenses: {
    addExpense: { method: HttpMethod.POST, path: "/expenses/add-expense" },
    getExpenses: { method: HttpMethod.GET, path: "/expenses/get-expense" },
    summary: { method: HttpMethod.GET, path: "/expenses/summary" },
    daily: { method: HttpMethod.GET, path: "/expenses/daily" },
    monthly: { method: HttpMethod.GET, path: "/expenses/monthly" },
  },
  budgets: {
    createBudget: { method: HttpMethod.POST, path: "/budgets/set-budget" },
    getBudgets: { method: HttpMethod.GET, path: "/budgets/get-budgets" },
  },
  notifications: {
    getNotifications: { method: HttpMethod.GET, path: "/notifications/get-not" },
    readNotification: ((notificationId: string) => ({
      method: HttpMethod.PATCH,
      path: `/notifications/${notificationId}/read`,
    })) as DynamicEndpoint<[string]>,
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
  },
  esusu: {
    createGroup: { method: HttpMethod.POST, path: "/esusu/create" },
    joinGroup: { method: HttpMethod.POST, path: "/esusu/join" },
    getGroup: ((groupId: string) => ({
      method: HttpMethod.GET,
      path: `/esusu/${groupId}`,
    })) as DynamicEndpoint<[string]>,
    contribute: { method: HttpMethod.POST, path: "/esusu/contribute" },
  },
  esusuPayouts: {
    process: { method: HttpMethod.POST, path: "/esusu/payouts/process" },
    retry: { method: HttpMethod.POST, path: "/esusu/payouts/retry" },
    history: ((groupId: string) => ({
      method: HttpMethod.GET,
      path: `/esusu/payouts/${groupId}/history`,
    })) as DynamicEndpoint<[string]>,
  },
  wallet: {
    getOrCreate: { method: HttpMethod.GET, path: "/wallet/create" },
    deposit: { method: HttpMethod.POST, path: "/wallet/deposit" },
    withdraw: { method: HttpMethod.POST, path: "/wallet/withdraw" },
    balance: { method: HttpMethod.GET, path: "/wallet/balance" },
    transactions: { method: HttpMethod.GET, path: "/wallet/transactions" },
    healthCheck: {
      method: HttpMethod.GET,
      path: "http://16.171.32.108:4000/api/v1",
      isExternal: true,
    },
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
