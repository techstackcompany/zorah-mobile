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
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<CreateBudgetResponse, ApiError, CreateBudgetRequest>({
    mutationKey: ["budgets", "create"],
    mutationFn: (payload) => {
      return apiRequest<CreateBudgetResponse>({
        ...API_ENDPOINTS.budgets.createBudget,
        data: payload,
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useGetBudgetsQuery = (
  options?: UseQueryOptions<
    BudgetListItem[] | ApiEnvelope<BudgetListItem[]>,
    ApiError
  >,
) =>
  useQuery<BudgetListItem[] | ApiEnvelope<BudgetListItem[]>, ApiError>({
    queryKey: ["budgets", "list"],
    queryFn: async () => {
      return apiRequest<ApiEnvelope<BudgetListItem[]> | BudgetListItem[]>({
        ...API_ENDPOINTS.budgets.getBudgets,
      });
    },
    ...options,
  });

export const useGetBudgetQuery = (
  budgetId: string,
  options?: UseQueryOptions<Budget, ApiError>,
) =>
  useQuery<Budget, ApiError>({
    queryKey: ["budgets", "detail", budgetId],
    queryFn: async () => {
      const response = await apiRequest<Budget | ApiEnvelope<Budget>>({
        ...API_ENDPOINTS.budgets.getBudget(budgetId),
      });

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
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<UpdateBudgetResponse, ApiError, UpdateBudgetRequest>({
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
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useDeleteBudgetMutation = (
  budgetId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "delete", budgetId],
    mutationFn: () => {
      if (!budgetId) {
        throw new Error("Budget ID is required");
      }
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.budgets.deleteBudget(budgetId),
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useArchiveBudgetMutation = (
  budgetId: string,
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "archive", budgetId],
    mutationFn: () => {
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.budgets.archiveBudget(budgetId),
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useRestoreBudgetMutation = (
  budgetId: string,
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "restore", budgetId],
    mutationFn: () => {
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.budgets.restoreBudget(budgetId),
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

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
        ...API_ENDPOINTS.budgets.getArchivedBudgets,
      });

      if (Array.isArray(response)) {
        return response;
      }

      return response;
    },
    ...options,
  });
