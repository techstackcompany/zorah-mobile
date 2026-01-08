import {
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

export const useCreateBudgetMutation = (
  options?: UseMutationOptions<
    CreateBudgetResponse,
    ApiError,
    CreateBudgetRequest
  >,
) =>
  useMutation<CreateBudgetResponse, ApiError, CreateBudgetRequest>({
    mutationKey: ["budgets", "create"],
    mutationFn: (payload) => {
      const endpoint = API_ENDPOINTS.budgets.createBudget;
      return apiRequest<CreateBudgetResponse>({
        ...endpoint,
        data: payload,
      });
    },
    ...options,
  });

export const useGetBudgetsQuery = (
  options?: UseQueryOptions<
    BudgetListItem[] | ApiEnvelope<BudgetListItem[]>,
    ApiError
  >,
) =>
  useQuery<BudgetListItem[] | ApiEnvelope<BudgetListItem[]>, ApiError>({
    queryKey: ["budgets", "list"],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.budgets.getBudgets;
      return apiRequest<ApiEnvelope<BudgetListItem[]> | BudgetListItem[]>({
        ...endpoint,
      });
    },
    ...options,
  });

export const useGetBudgetQuery = (
  budgetId: string | undefined,
  options?: UseQueryOptions<Budget, ApiError>,
) =>
  useQuery<Budget, ApiError>({
    queryKey: ["budgets", "detail", budgetId],
    queryFn: async () => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      const endpoint = API_ENDPOINTS.budgets.getBudget(budgetId);
      const response = await apiRequest<Budget | ApiEnvelope<Budget>>({
        ...endpoint,
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
  options?: UseMutationOptions<
    UpdateBudgetResponse,
    ApiError,
    UpdateBudgetRequest
  >,
) =>
  useMutation<UpdateBudgetResponse, ApiError, UpdateBudgetRequest>({
    mutationKey: ["budgets", "update", budgetId],
    mutationFn: (payload) => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      const endpoint = API_ENDPOINTS.budgets.updateBudget(budgetId);
      return apiRequest<UpdateBudgetResponse>({
        ...endpoint,
        data: payload,
      });
    },
    ...options,
  });

export const useDeleteBudgetMutation = (
  budgetId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
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
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
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
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
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

export const useGetArchivedBudgetsQuery = (
  options?: UseQueryOptions<
    BudgetListItem[] | ApiEnvelope<BudgetListItem[]>,
    ApiError
  >,
) =>
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
