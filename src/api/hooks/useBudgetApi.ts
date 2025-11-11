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
  ApiEnvelope,
  Budget,
  CreateBudgetRequest,
  CreateBudgetResponse,
} from "../types";

type BudgetQueryOptions = Omit<
  UseQueryOptions<
    Budget[] | ApiEnvelope<Budget[]>,
    ApiError,
    Budget[] | ApiEnvelope<Budget[]>,
    QueryKey
  >,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  "mutationFn"
>;

export const useCreateBudgetMutation = (
  options?: MutationOptions<CreateBudgetResponse, CreateBudgetRequest>,
) =>
  useMutation<CreateBudgetResponse, ApiError, CreateBudgetRequest>({
    mutationKey: ["budgets", "create"],
    mutationFn: (payload) =>
      apiRequest<CreateBudgetResponse>({
        method: API_ENDPOINTS.budgets.createBudget.method,
        url: API_ENDPOINTS.budgets.createBudget.path,
        data: payload,
      }),
    ...options,
  });

export const useGetBudgetsQuery = (options?: BudgetQueryOptions) =>
  useQuery<Budget[] | ApiEnvelope<Budget[]>, ApiError>({
    queryKey: ["budgets", "list"],
    queryFn: async () => {
      const response = await apiRequest<ApiEnvelope<Budget[]> | Budget[]>({
        method: API_ENDPOINTS.budgets.getBudgets.method,
        url: API_ENDPOINTS.budgets.getBudgets.path,
      });

      // The API might return either ApiEnvelope<Budget[]> or a raw array
      if (Array.isArray(response)) {
        return response;
      }

      return response;
    },
    ...options,
  });
