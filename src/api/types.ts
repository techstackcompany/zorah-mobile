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
  firstName: string;
  lastName: string;
  phoneNumber: string;
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

export interface LoginUserResponse extends AuthTokens {
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface RegisterUserResponse {
  _id: string;
  email: string;
  name: string;
  token: string;
  [key: string]: unknown;
}

export interface UserOnboarding {
  currentStep?: string;
  financialGoals: string[];
  hasCompletedOnboarding: boolean;
  incomeSource: string[];
  stepsCompleted: string[];
}

export interface UserUsageMetrics {
  aiSessionsCount: number;
  expensesLoggedCount: number;
  isFeatureLocked: boolean;
  lastInteractionDate: string;
}

export interface UserProfile {
  _id: string;
  __v?: number;
  authProvider?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  fcmTokens?: string[];
  hasPin?: boolean;
  pin?: string;
  biometricEnabled: boolean;
  KycStatus?: "unverified" | "pending" | "verified" | (string & {});
  onboarding?: UserOnboarding;
  preferredReminderHour?: number;
  refreshToken?: string;
  usageMetrics?: UserUsageMetrics;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface SetPinRequest {
  pin: string;
}

export type VerifyPinRequest = SetPinRequest;

export interface ToggleBiometricsRequest {
  enabled: boolean;
}

export interface UpdateOnboardingRequest {
  incomeSource?: string | string[];
  incomeRange?: string;
  financialGoals?: string[];
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

export interface RefreshTokenResponse {
  accessToken: string;
}

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
  [key: string]: unknown;
}

export interface ExpenseSummaryFilter {
  type: "daily" | "weekly" | "monthly" | (string & {});
}

export type ExpenseSummaryApiResponse = {
  category: string;
  count: number;
  total: number;
}[];

export type ExpenseSummary = {
  type: ExpenseSummaryFilter["type"];
  total: number;
  byCategory: ExpenseSummaryApiResponse;
};

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

export type SpendingOverviewTimeframe = "daily" | "weekly" | "monthly";

export interface SpendingOverviewChartDataItem {
  _id: {
    day?: number;
    month?: number;
    year?: number;
    week?: number;
  };
  totalAmount: number;
}

export interface SpendingOverviewComparison {
  isIncrease: boolean;
  percentage: string;
}

export interface SpendingOverviewResponse {
  timeframe: SpendingOverviewTimeframe;
  chartData: SpendingOverviewChartDataItem[];
  comparison: SpendingOverviewComparison;
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
  _id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetIncomesResponse {
  success: boolean;
  count: number;
  data: Income[];
}

/* ---------------------------------------------
   Budgets
----------------------------------------------*/
export interface CreateBudgetRequest {
  category: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
}

export interface Budget {
  _id?: string;
  user?: string;
  category: string;
  amount?: number;
  Limit?: number;
  period?: "weekly" | "monthly" | "yearly";
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
}

export interface BudgetListItem {
  _id: string;
  user?: string;
  category: string;
  amount?: number;
  Limit?: number;
  period?: "weekly" | "monthly" | "yearly";
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
}

export interface CreateBudgetResponse {
  message: string;
  budget: Budget;
}

export interface UpdateBudgetRequest {
  category: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly";
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
export type NotificationType = "bill_alert" | "bill_reminder";

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterNotificationTokenRequest {
  fcmToken: string;
}

export interface SendTestNotificationRequest {
  fcmToken: string;
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
  category?: string;
  description?: string;
}

export interface SavingsGoal extends CreateSavingsGoalRequest {
  _id?: string;
  user: string;
  currentAmount: number;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
  fundingHistory: SavingsGoalContribution[];
}

export interface SavingsGoalContribution {
  _id: string;
  amount: number;
  date: string;
}

export interface ContributeToSavingsRequest {
  goalId: string;
  amount: number;
}

export interface UpdateSavingsGoalRequest {
  title: string;
  targetAmount: number;
  deadline: string;
  category?: string;
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
  reference: string;
  status: "pending" | "successful" | "failed";
  metadata?: {
    category?: string;
    description?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  user: string;
}

interface TransactionMetadata {
  category: string;
  description: string;
}

interface DepositMetadata {
  status: boolean;
  message: string;
  data: {
    amount: number;
    reference: string;
    customer_id: string;
    metadata: {
      purpose: string;
    };
    transaction_fee: number;
    merchantId: string;
    customer_wallet_id: string;
  };
}

type TransactionType = "debit" | "credit";

type TransactionPurpose =
  | "deposit"
  | "withdrawal"
  | "savings"
  | "transfer"
  | "savings_contribution"
  | "other";

type TransactionStatus = "successful" | "pending" | string;

interface BaseTransaction {
  _id: string;
  __v: number;
  user: string;
  type: TransactionType;
  amount: number;
  purpose: TransactionPurpose;
  reference?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseIncomeTransaction extends BaseTransaction {
  purpose: "other";
  metadata: TransactionMetadata;
}

interface SavingsTransaction extends BaseTransaction {
  purpose: "savings_contribution";
  metadata?: never;
}

interface DepositTransaction extends BaseTransaction {
  type: "credit";
  purpose: "deposit";
  metadata: DepositMetadata;
}

export type Transaction =
  | ExpenseIncomeTransaction
  | SavingsTransaction
  | DepositTransaction;

export type TransactionsResponse = Transaction[];

export interface WalletDetails {
  id?: string;
  userId?: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface WalletOverviewResponse {
  account: {
    balance: number;
    accountNumber: string;
    accountName: string;
    tier: number;
  };
  kyc: {
    status: "ACTIVE" | string;
    currentTier: number;
  };
  recentTransactions: WalletTransaction[];
  userSettings: {
    biometricEnabled: boolean;
  };
}

/* ---------------------------------------------
   Categories
----------------------------------------------*/
export type CategoryType = "income" | "expense" | "budget" | "savings";

export interface CategoryResponseItem {
  _id: string;
  name: Lowercase<string>;
  image: string;
}

export type CategoryItem<K extends string = string> = {
  key: K;
  label: string;
  icon: string;
};

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

export type FxPairsResponse = FxRatePair[];

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
}

/* ---------------------------------------------
   Bill  Reminders
----------------------------------------------*/

export interface BillReminder {
  _id: string;
  user: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  frequency: string;
  status: string;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBillRemindersResponse {
  summary: {
    totalMonthly: number;
    totalPaid: number;
    totalDue: number;
  };
  bills: BillReminder[];
}

export interface PayBillReminderResponse {
  message: string;
  bill: BillReminder;
}

export interface AddBillReminderRequest {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  paymentMethod: string;
  reminderEnabled: boolean;
}

export interface AddBillReminderResponse {
  status: string;
  data: {
    user: {
      _id: string;
      email: string;
    };
    name: string;
    amount: number;
    dueDate: string;
    category: string;
    frequency: string;
    status: string;
    reminderEnabled: boolean;
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateBillReminderRequest {
  name?: string;
  amount?: number;
  dueDate?: string;
  category?: string;
  paymentMethod?: string;
  reminderEnabled?: boolean;
}

export interface UpdateBillReminderResponse {
  message: string;
  bill: BillReminder;
}
/* ---------------------------------------------
   Countries   
----------------------------------------------*/

export type NigerianState = {
  name: string;
  state_code: string;
};
