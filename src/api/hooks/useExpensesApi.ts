import {
  useMutation,
  UseMutationOptions,
  useQuery,
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
  ExpenseSummaryFilter,
  MonthlyExpenseTotal,
  UpdateExpenseRequest,
} from "../types";

export const useAddExpenseMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<Expense>,
    ApiError,
    AddExpenseRequest
  >,
) =>
  useMutation<ApiEnvelope<Expense>, ApiError, AddExpenseRequest>({
    mutationKey: ["expenses", "addExpense"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<Expense>>({
        method: API_ENDPOINTS.expenses.addExpense.method,
        url: API_ENDPOINTS.expenses.addExpense.path,
        data: payload,
      }),
    ...options,
  });

type VoiceExpenseResponse = {
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
};

export const useVoiceExpenseLoggingMutation = (
  options?: UseMutationOptions<VoiceExpenseResponse, ApiError, FormData>,
) =>
  useMutation<VoiceExpenseResponse, ApiError, FormData>({
    mutationKey: ["expenses", "voiceLogExpense"],
    mutationFn: (formData) =>
      apiRequest<VoiceExpenseResponse>({
        method: API_ENDPOINTS.expenses.voiceLogExpense.method,
        url: API_ENDPOINTS.expenses.voiceLogExpense.path,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    ...options,
  });

export const useUpdateExpenseMutation = (
  expenseId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<Expense>,
    ApiError,
    UpdateExpenseRequest
  >,
) =>
  useMutation<ApiEnvelope<Expense>, ApiError, UpdateExpenseRequest>({
    mutationKey: ["expenses", "update", expenseId],
    mutationFn: (payload) => {
      if (!expenseId) {
        throw new Error("Expense ID is required");
      }
      const endpoint = API_ENDPOINTS.expenses.updateExpense(expenseId);
      return apiRequest<ApiEnvelope<Expense>>({
        method: endpoint.method,
        url: endpoint.path,
        data: payload,
      });
    },
    ...options,
  });

export const useDeleteExpenseMutation = (
  expenseId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
) =>
  useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["expenses", "delete", expenseId],
    mutationFn: () => {
      if (!expenseId) {
        throw new Error("Expense ID is required");
      }
      const endpoint = API_ENDPOINTS.expenses.deleteExpense(expenseId);
      return apiRequest<ApiEnvelope<{ message: string }>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    ...options,
  });

export const useGetExpensesQuery = (
  options?: UseQueryOptions<ApiEnvelope<Expense[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<Expense[]>, ApiError>({
    queryKey: ["expenses", "all"],
    queryFn: async () => {
      const response = await apiRequest<ApiEnvelope<Expense[]>>({
        method: API_ENDPOINTS.expenses.getExpenses.method,
        url: API_ENDPOINTS.expenses.getExpenses.path,
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
        method: endpoint.method,
        url: endpoint.path,
      });
      return response;
    },
    enabled: !!expenseId,
    ...options,
  });

export const useGetExpenseSummaryQuery = (
  type: ExpenseSummaryFilter["type"],
  options?: UseQueryOptions<ApiEnvelope<ExpenseSummary>, ApiError>,
) =>
  useQuery<ApiEnvelope<ExpenseSummary>, ApiError>({
    queryKey: ["expenses", "summary", type],
    queryFn: async () => {
      const response = await apiRequest<ApiEnvelope<ExpenseSummary>>({
        method: API_ENDPOINTS.expenses.summary.method,
        url: API_ENDPOINTS.expenses.summary.path,
        params: { type },
      });

      if (Array.isArray(response)) {
     
        const summary: ExpenseSummary = {
          type,
          total: response.reduce((acc, item) => acc + item.total, 0),
          byCategory: response,
        };
        return { data: summary };
      }

      return response;
    },
    ...options,
  });

export const useGetDailyExpensesQuery = (
  options?: UseQueryOptions<ApiEnvelope<DailyExpenseTotal[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<DailyExpenseTotal[]>, ApiError>({
    queryKey: ["expenses", "daily"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<DailyExpenseTotal[]> | DailyExpenseTotal[]
      >({
        method: API_ENDPOINTS.expenses.daily.method,
        url: API_ENDPOINTS.expenses.daily.path,
      });

      // Handle case where API returns array directly
      if (Array.isArray(response)) {
        return { data: response };
      }

      return response;
    },
    ...options,
  });

export const useGetMonthlyExpensesQuery = (
  options?: UseQueryOptions<ApiEnvelope<MonthlyExpenseTotal[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<MonthlyExpenseTotal[]>, ApiError>({
    queryKey: ["expenses", "monthly"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<MonthlyExpenseTotal[]> | MonthlyExpenseTotal[]
      >({
        method: API_ENDPOINTS.expenses.monthly.method,
        url: API_ENDPOINTS.expenses.monthly.path,
      });

      // Handle case where API returns array directly
      if (Array.isArray(response)) {
        return { data: response };
      }

      return response;
    },
    ...options,
  });
