import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { apiRequest, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  AddExpenseRequest,
  ApiEnvelope,
  Expense,
  ExpenseSummary,
  ExpenseSummaryFilter,
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

export const useGetExpensesQuery = (
  options?: QueryOptions<Expense[]>,
) =>
  useQuery<ApiEnvelope<Expense[]>, ApiError>({
    queryKey: ["expenses", "all"],
    queryFn: () =>
      apiRequest<ApiEnvelope<Expense[]>>({
        method: API_ENDPOINTS.expenses.getExpenses.method,
        url: API_ENDPOINTS.expenses.getExpenses.path,
      }),
    ...options,
  });

export const useGetExpenseSummaryQuery = (
  type: ExpenseSummaryFilter["type"],
  options?: QueryOptions<ExpenseSummary>,
) =>
  useQuery<ApiEnvelope<ExpenseSummary>, ApiError>({
    queryKey: ["expenses", "summary", type],
    queryFn: () =>
      apiRequest<ApiEnvelope<ExpenseSummary>>({
        method: API_ENDPOINTS.expenses.summary.method,
        url: API_ENDPOINTS.expenses.summary.path,
        params: { type },
      }),
    ...options,
  });

export const useGetDailyExpensesQuery = (
  options?: QueryOptions<Expense[]>,
) =>
  useQuery<ApiEnvelope<Expense[]>, ApiError>({
    queryKey: ["expenses", "daily"],
    queryFn: () =>
      apiRequest<ApiEnvelope<Expense[]>>({
        method: API_ENDPOINTS.expenses.daily.method,
        url: API_ENDPOINTS.expenses.daily.path,
      }),
    ...options,
  });

export const useGetMonthlyExpensesQuery = (
  options?: QueryOptions<Expense[]>,
) =>
  useQuery<ApiEnvelope<Expense[]>, ApiError>({
    queryKey: ["expenses", "monthly"],
    queryFn: () =>
      apiRequest<ApiEnvelope<Expense[]>>({
        method: API_ENDPOINTS.expenses.monthly.method,
        url: API_ENDPOINTS.expenses.monthly.path,
      }),
    ...options,
  });
