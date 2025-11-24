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
  BudgetListItem,
  CreateBudgetRequest,
  CreateBudgetResponse,
  UpdateBudgetRequest,
  UpdateBudgetResponse,
} from "../types";

type BudgetQueryOptions = Omit<
  UseQueryOptions<
    BudgetListItem[] | ApiEnvelope<BudgetListItem[]>,
    ApiError,
    BudgetListItem[] | ApiEnvelope<BudgetListItem[]>,
    QueryKey
  >,
  "queryKey" | "queryFn"
>;

type BudgetDetailQueryOptions = Omit<
  UseQueryOptions<Budget, ApiError, Budget, QueryKey>,
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
  useQuery<BudgetListItem[] | ApiEnvelope<BudgetListItem[]>, ApiError>({
    queryKey: ["budgets", "list"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<BudgetListItem[]> | BudgetListItem[]
      >({
        method: API_ENDPOINTS.budgets.getBudgets.method,
        url: API_ENDPOINTS.budgets.getBudgets.path,
      });

      if (Array.isArray(response)) {
        return response;
      }

      return response;
    },
    ...options,
  });

export const useGetBudgetQuery = (
  budgetId: string | undefined,
  options?: BudgetDetailQueryOptions,
) =>
  useQuery<Budget, ApiError>({
    queryKey: ["budgets", "detail", budgetId],
    queryFn: async () => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      const endpoint = API_ENDPOINTS.budgets.getBudget(budgetId);
      const response = await apiRequest<Budget | ApiEnvelope<Budget>>({
        method: endpoint.method,
        url: endpoint.path,
      });

      // The API might return either ApiEnvelope<Budget> or a raw Budget object
      if (Array.isArray(response)) {
        throw new Error("Unexpected array response for single budget");
      }

      // Unwrap ApiEnvelope if needed
      if (response && typeof response === "object" && "data" in response) {
        return (response as ApiEnvelope<Budget>).data as Budget;
      }

      return response as Budget;
    },
    enabled: !!budgetId,
    ...options,
  });

export const useUpdateBudgetMutation = (
  budgetId: string | undefined,
  options?: MutationOptions<UpdateBudgetResponse, UpdateBudgetRequest>,
) =>
  useMutation<UpdateBudgetResponse, ApiError, UpdateBudgetRequest>({
    mutationKey: ["budgets", "update", budgetId],
    mutationFn: (payload) => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      const endpoint = API_ENDPOINTS.budgets.updateBudget(budgetId);
      return apiRequest<UpdateBudgetResponse>({
        method: endpoint.method,
        url: endpoint.path,
        data: payload,
      });
    },
    ...options,
  });

export const useDeleteBudgetMutation = (
  budgetId: string | undefined,
  options?: MutationOptions<ApiEnvelope<{ message: string }>, void>,
) =>
  useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "delete", budgetId],
    mutationFn: () => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      const endpoint = API_ENDPOINTS.budgets.deleteBudget(budgetId);
      return apiRequest<ApiEnvelope<{ message: string }>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    ...options,
  });

export const useArchiveBudgetMutation = (
  budgetId: string | undefined,
  options?: MutationOptions<ApiEnvelope<{ message: string }>, void>,
) =>
  useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "archive", budgetId],
    mutationFn: () => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      const endpoint = API_ENDPOINTS.budgets.archiveBudget(budgetId);
      return apiRequest<ApiEnvelope<{ message: string }>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    ...options,
  });

export const useRestoreBudgetMutation = (
  budgetId: string | undefined,
  options?: MutationOptions<ApiEnvelope<{ message: string }>, void>,
) =>
  useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "restore", budgetId],
    mutationFn: () => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      const endpoint = API_ENDPOINTS.budgets.restoreBudget(budgetId);
      return apiRequest<ApiEnvelope<{ message: string }>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    ...options,
  });

export const useGetArchivedBudgetsQuery = (options?: BudgetQueryOptions) =>
  useQuery<BudgetListItem[] | ApiEnvelope<BudgetListItem[]>, ApiError>({
    queryKey: ["budgets", "archived"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<BudgetListItem[]> | BudgetListItem[]
      >({
        method: API_ENDPOINTS.budgets.getArchivedBudgets.method,
        url: API_ENDPOINTS.budgets.getArchivedBudgets.path,
      });

      if (Array.isArray(response)) {
        return response;
      }

      return response;
    },
    ...options,
  });
