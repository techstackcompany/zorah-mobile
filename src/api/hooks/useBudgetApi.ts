import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { apiRequest, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiEnvelope, Budget, CreateBudgetRequest } from "../types";

type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<ApiEnvelope<TData>, ApiError, ApiEnvelope<TData>, TQueryKey>,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiEnvelope<TData>, ApiError, TVariables>,
  "mutationFn"
>;

export const useCreateBudgetMutation = (
  options?: MutationOptions<Budget, CreateBudgetRequest>,
) =>
  useMutation<ApiEnvelope<Budget>, ApiError, CreateBudgetRequest>({
    mutationKey: ["budgets", "create"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<Budget>>({
        method: API_ENDPOINTS.budgets.createBudget.method,
        url: API_ENDPOINTS.budgets.createBudget.path,
        data: payload,
      }),
    ...options,
  });

export const useGetBudgetsQuery = (
  options?: QueryOptions<Budget[]>,
) =>
  useQuery<ApiEnvelope<Budget[]>, ApiError>({
    queryKey: ["budgets", "list"],
    queryFn: () =>
      apiRequest<ApiEnvelope<Budget[]>>({
        method: API_ENDPOINTS.budgets.getBudgets.method,
        url: API_ENDPOINTS.budgets.getBudgets.path,
      }),
    ...options,
  });
