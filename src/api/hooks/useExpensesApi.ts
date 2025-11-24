import {
  QueryKey,
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

type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<ApiEnvelope<TData>, ApiError, ApiEnvelope<TData>, TQueryKey>,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiEnvelope<TData>, ApiError, TVariables>,
  "mutationFn"
>;

export const useAddExpenseMutation = (
  options?: MutationOptions<Expense, AddExpenseRequest>,
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

export const useUpdateExpenseMutation = (
  expenseId: string | undefined,
  options?: MutationOptions<Expense, UpdateExpenseRequest>,
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

export const useGetExpensesQuery = (options?: QueryOptions<Expense[]>) =>
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
  options?: QueryOptions<Expense>,
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
  options?: QueryOptions<ExpenseSummary>,
) =>
  useQuery<ApiEnvelope<ExpenseSummary>, ApiError>({
    queryKey: ["expenses", "summary", type],
    queryFn: async () => {
      const response = await apiRequest<ApiEnvelope<ExpenseSummary>>({
        method: API_ENDPOINTS.expenses.summary.method,
        url: API_ENDPOINTS.expenses.summary.path,
        params: { type },
      });

      // The API might return either ApiEnvelope<ExpenseSummary> or a raw array
      if (Array.isArray(response)) {
        // Wrap array in an ApiEnvelope with a structure compatible with ExpenseSummary
        // Note: This assumes `type` can be passed and total is sum of totals
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
  options?: QueryOptions<DailyExpenseTotal[]>,
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
  options?: QueryOptions<MonthlyExpenseTotal[]>,
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
