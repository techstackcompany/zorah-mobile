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
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  hasPin?: boolean;
  pin?: string;
  biometricEnabled?: boolean;
  biometricsEnabled?: boolean; // alias for compatibility
  KycStatus?: "unverified" | "pending" | "verified" | (string & {});
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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

export interface UpdateExpenseRequest {
  amount?: number;
  category?: string;
  description?: string;
  paymentMethod?: string;
  date?: string;
}

export interface Expense extends AddExpenseRequest {
  _id?: string;
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
  categories?: {
    category: string;
    amount: number;
    percentage?: number;
  }[];
  [key: string]: unknown;
}

export interface DailyExpenseTotal {
  _id: {
    day: number;
    month: number;
    year: number;
  };
  total: number;
}

export interface MonthlyExpenseTotal {
  _id: {
    month: number;
    year: number;
  };
  total: number;
}

/* ---------------------------------------------
   Income
----------------------------------------------*/
export interface AddIncomeRequest {
  source: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export type UpdateIncomeRequest = Partial<AddIncomeRequest>;

export interface Income extends AddIncomeRequest {
  _id?: string;
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
  Limit?: number;
  period?: "weekly" | "monthly" | "yearly" | string;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  spent?: number;
  totalSpent?: number;
  remaining?: number;
  percentageused?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface BudgetListItem {
  _id: string;
  user?: string;
  category: string;
  amount?: number;
  Limit?: number;
  period?: "weekly" | "monthly" | "yearly" | (string & {});
  month?: number | null;
  year?: number | null;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  spent?: number;
  totalSpent?: number;
  remaining?: number;
  percentageused?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CreateBudgetResponse {
  message: string;
  budget: Budget;
}

export interface UpdateBudgetRequest {
  category: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly" | (string & {});
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetResponse {
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
  _id?: string;
  id?: string; // For backward compatibility
  user?: string;
  currentAmount?: number;
  status?: "active" | "completed" | "paused" | (string & {});
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  [key: string]: unknown;
}

export interface ContributeToSavingsRequest {
  goalId: string;
  amount: number;
}

export interface UpdateSavingsGoalRequest {
  title: string;
  targetAmount: number;
  deadline: string;
  description?: string;
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
  _id: string;
  amount: number;
  type: "credit" | "debit" | string;
  purpose:
    | "deposit"
    | "withdrawal"
    | "savings"
    | "transfer"
    | "savings_contribution"
    | "other";
  description?: string;
  reference: string;
  createdAt?: string;
  updatedAt?: string;
  user: string;
  __v: number;
}

export interface WalletDetails {
  id?: string;
  userId?: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/* ---------------------------------------------
   Categories
----------------------------------------------*/
export type CategoryType = "income" | "expense" | "budget" | "savings";

export interface CategorySubcategory {
  _id: string;
  name: string;
  image: string;
}

export interface Category {
  _id: string;
  name: string;
  type: CategoryType;
  image: string;
  subcategories: CategorySubcategory[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/* ---------------------------------------------
   FX Rates
----------------------------------------------*/
export interface FxRateResponse {
  result: string;
  base_code: string;
  time_last_update_utc?: string;
  time_next_update_utc?: string;
  conversion_rates: Record<string, number>;
}

export interface FxPairQuote {
  base_code: string;
  target_code: string;
  conversion_rate: number;
  conversion_result?: number;
  time_last_update_utc?: string;
  time_next_update_utc?: string;
}

export type FxPairsResponse = FxRatePair[]
 


export interface FxRatePair {
  base_code: string;
  target_code: string;
  conversion_rate: number;
  change_percent: number;
  time_last_update_utc: string;
  time_next_update_utc: string;
}

export interface FxHistoricalData {
  date: string;
  rate: number;
}

/* ---------------------------------------------
   KYC
----------------------------------------------*/
export interface SubmitKycRequest {
  tier: number;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  bvn: string;
  nin: string;
}

export interface SubmitKycResponse {
  status?: string;
  reference?: string;
  [key: string]: unknown;
}
