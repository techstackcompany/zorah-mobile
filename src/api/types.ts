export interface ApiEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

/* ---------------------------------------------
   Auth & User
----------------------------------------------*/
export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginUserResponse extends ApiEnvelope<UserProfile> {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterUserResponse {
  _id: string;
  email: string;
  name: string;
  token: string;
  [key: string]: unknown;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  hasPin?: boolean;
  biometricsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SetPinRequest {
  pin: string;
}

export type VerifyPinRequest = SetPinRequest;

export interface ToggleBiometricsRequest {
  enabled: boolean;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse extends AuthTokens {}

/* ---------------------------------------------
   Expenses
----------------------------------------------*/
export interface AddExpenseRequest {
  amount: number;
  category: string;
  description?: string;
  paymentMethod?: string;
  date: string;
}

export interface Expense extends AddExpenseRequest {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ExpenseSummaryFilter {
  type: "daily" | "weekly" | "monthly" | (string & {});
}

export interface ExpenseSummary {
  type: string;
  total: number;
  currency?: string;
  categories?: Array<{
    category: string;
    amount: number;
    percentage?: number;
  }>;
  [key: string]: unknown;
}

/* ---------------------------------------------
   Budgets
----------------------------------------------*/
export interface CreateBudgetRequest {
  category: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly" | (string & {});
  startDate: string;
  endDate: string;
}

export interface Budget {
  _id?: string;
  user?: string;
  category: string;
  amount?: number;
  Limit?: number; // API response uses "Limit" with capital L
  period?: "weekly" | "monthly" | "yearly" | (string & {});
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  spent?: number;
  totalSpent?: number; // API response uses "totalSpent"
  remaining?: number;
  percentageused?: string; // API response format: "0.00%"
  status?: string; // API response format: "On track ✅"
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  [key: string]: unknown;
}

export interface CreateBudgetResponse {
  message: string;
  budget: Budget;
}

/* ---------------------------------------------
   Notifications
----------------------------------------------*/
export interface Notification {
  id?: string;
  title?: string;
  body?: string;
  isRead?: boolean;
  type?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface RegisterNotificationTokenRequest {
  expoPushToken: string;
}

export interface SendTestNotificationRequest {
  expoPushToken: string;
  title: string;
  body: string;
}

/* ---------------------------------------------
   Savings Goals
----------------------------------------------*/
export interface CreateSavingsGoalRequest {
  title: string;
  targetAmount: number;
  deadline: string;
  description?: string;
}

export interface SavingsGoal extends CreateSavingsGoalRequest {
  id?: string;
  currentAmount?: number;
  status?: "active" | "completed" | "paused" | (string & {});
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ContributeToSavingsRequest {
  goalId: string;
  amount: number;
}

/* ---------------------------------------------
   Esusu
----------------------------------------------*/
export interface CreateEsusuRequest {
  name: string;
  contributionAmount: number;
  frequency: "daily" | "weekly" | "monthly" | (string & {});
}

export interface JoinEsusuRequest {
  groupId: string;
}

export interface EsusuGroup extends CreateEsusuRequest {
  id?: string;
  members?: Array<Record<string, unknown>>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ContributeToEsusuRequest {
  groupId: string;
  amount: number;
}

export interface EsusuPayoutHistoryItem {
  id?: string;
  groupId?: string;
  memberId?: string;
  amount?: number;
  status?: string;
  payoutDate?: string;
  [key: string]: unknown;
}

/* ---------------------------------------------
   Wallets
----------------------------------------------*/
export interface DepositFundsRequest {
  amount: number;
}

export type WithdrawFundsRequest = DepositFundsRequest;

export interface WalletBalance {
  balance: number;
  currency?: string;
  [key: string]: unknown;
}

export interface WalletTransaction {
  id?: string;
  amount: number;
  type: "credit" | "debit" | (string & {});
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface WalletDetails {
  id?: string;
  userId?: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
