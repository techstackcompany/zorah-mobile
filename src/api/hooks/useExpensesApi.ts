import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  AddExpenseRequest,
  ApiEnvelope,
  DailyExpenseTotal,
  Expense,
  ExpenseSummary,
  ExpenseSummaryApiResponse,
  ExpenseSummaryFilter,
  MonthlyExpenseTotal,
  SpendingOverviewResponse,
  SpendingOverviewTimeframe,
  UpdateExpenseRequest,
} from "../types";

export const useAddExpenseMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<Expense>,
    ApiError,
    AddExpenseRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<Expense>, ApiError, AddExpenseRequest>({
    mutationKey: ["expenses", "addExpense"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<Expense>>({
        ...API_ENDPOINTS.expenses.addExpense,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

type VoiceExpenseResponse = {
  message: string;
  status: string;
  transaction: {
    _id: string;
    amount: number;
    createdAt: string;
    updatedAt: string;
    metadata: {
      category: string;
      description: string;
    };
    purpose: string;
    reference: string;
    status: string;
    type: string;
    user: string;
  };
};

type VoiceExpenseRequest = {
  message: string;
};

export const useVoiceExpenseLoggingMutation = (
  options?: UseMutationOptions<
    VoiceExpenseResponse,
    ApiError,
    VoiceExpenseRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<VoiceExpenseResponse, ApiError, VoiceExpenseRequest>({
    mutationKey: ["expenses", "voiceLogExpense"],
    mutationFn: (payload) =>
      apiRequest<VoiceExpenseResponse>({
        ...API_ENDPOINTS.expenses.voiceLogExpense,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useUpdateExpenseMutation = (
  expenseId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<Expense>,
    ApiError,
    UpdateExpenseRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<Expense>, ApiError, UpdateExpenseRequest>({
    mutationKey: ["expenses", "update", expenseId],
    mutationFn: (payload) => {
      if (!expenseId) {
        throw new Error("Expense ID is required");
      }
      const endpoint = API_ENDPOINTS.expenses.updateExpense(expenseId);
      return apiRequest<ApiEnvelope<Expense>>({
        ...endpoint,
        data: payload,
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useDeleteExpenseMutation = (
  expenseId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["expenses", "delete", expenseId],
    mutationFn: () => {
      if (!expenseId) {
        throw new Error("Expense ID is required");
      }
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.expenses.deleteExpense(expenseId),
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useGetExpensesQuery = (
  options?: Partial<UseQueryOptions<ApiEnvelope<Expense[]>, ApiError>>,
) =>
  useQuery<ApiEnvelope<Expense[]>, ApiError>({
    queryKey: ["expenses", "all"],
    queryFn: async () => {
      const response = await apiRequest<ApiEnvelope<Expense[]>>({
        ...API_ENDPOINTS.expenses.getExpenses,
      });
      return response;
    },
    ...options,
  });

export const useGetExpenseQuery = (
  expenseId: string | undefined,
  options?: Partial<UseQueryOptions<ApiEnvelope<Expense>, ApiError>>,
) =>
  useQuery<ApiEnvelope<Expense>, ApiError>({
    queryKey: ["expenses", "detail", expenseId],
    queryFn: async () => {
      if (!expenseId) {
        throw new Error("Expense ID is required");
      }
      const endpoint = API_ENDPOINTS.expenses.getExpense(expenseId);
      const response = await apiRequest<ApiEnvelope<Expense>>({
        ...endpoint,
      });
      return response;
    },
    enabled: !!expenseId,
    ...options,
  });

export const useGetExpenseSummaryQuery = (
  type: ExpenseSummaryFilter["type"],
  options?: Partial<UseQueryOptions<ExpenseSummary, ApiError>>,
) =>
  useQuery<ExpenseSummary, ApiError>({
    queryKey: ["expenses", "summary", type],
    queryFn: async () => {
      const response = await apiRequest<ExpenseSummaryApiResponse>({
        ...API_ENDPOINTS.expenses.summary,
        params: { type },
      });
      console.log("response in useGetExpenseSummaryQuery", response, "\n\n");
    
        const summary: ExpenseSummary = {
          type,
          total: response.reduce((acc, item) => acc + item.total, 0),
          byCategory: response,
        };
        return summary;
      

    },
    ...options,
  });

export const useGetDailyExpensesQuery = (
  options?: Partial<
    UseQueryOptions<ApiEnvelope<DailyExpenseTotal[]>, ApiError>
  >,
) =>
  useQuery<ApiEnvelope<DailyExpenseTotal[]>, ApiError>({
    queryKey: ["expenses", "daily"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<DailyExpenseTotal[]> | DailyExpenseTotal[]
      >({
        ...API_ENDPOINTS.expenses.daily,
      });

      if (Array.isArray(response)) {
        return { data: response };
      }

      return response;
    },
    ...options,
  });

export const useGetMonthlyExpensesQuery = (
  options?: Partial<
    UseQueryOptions<ApiEnvelope<MonthlyExpenseTotal[]>, ApiError>
  >,
) =>
  useQuery<ApiEnvelope<MonthlyExpenseTotal[]>, ApiError>({
    queryKey: ["expenses", "monthly"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<MonthlyExpenseTotal[]> | MonthlyExpenseTotal[]
      >({
        ...API_ENDPOINTS.expenses.monthly,
      });

      if (Array.isArray(response)) {
        return { data: response };
      }

      return response;
    },
    ...options,
  });

export const useGetSpendingOverviewQuery = (
  timeframe: SpendingOverviewTimeframe = "monthly",
  options?: Partial<UseQueryOptions<SpendingOverviewResponse, ApiError>>,
) =>
  useQuery<SpendingOverviewResponse, ApiError>({
    queryKey: ["expenses", "spendingOverview", timeframe],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.expenses.spendingOverview(timeframe);
      const response = await apiRequest<
        SpendingOverviewResponse | ApiEnvelope<SpendingOverviewResponse>
      >({
        ...endpoint,
      });

      if ("chartData" in response) {
        return response as SpendingOverviewResponse;
      }

      return (response as ApiEnvelope<SpendingOverviewResponse>)
        .data as SpendingOverviewResponse;
    },
    ...options,
  });
