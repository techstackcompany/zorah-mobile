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
    CreateBudgetRequest,
    { snapshot: BudgetListItem[] | ApiEnvelope<BudgetListItem[]> | undefined }
  >,
) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: callerOnSuccess,
    onError: callerOnError,
    onSettled: callerOnSettled,
    ...restOptions
  } = options ?? {};

  return useMutation<
    CreateBudgetResponse,
    ApiError,
    CreateBudgetRequest,
    { snapshot: BudgetListItem[] | ApiEnvelope<BudgetListItem[]> | undefined }
  >({
    mutationKey: ["budgets", "create"],
    mutationFn: (payload) =>
      apiRequest<CreateBudgetResponse>({
        ...API_ENDPOINTS.budgets.createBudget,
        data: payload,
      }),
    ...restOptions,

    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: ["budgets", "list"] });
      const snapshot = queryClient.getQueryData<
        BudgetListItem[] | ApiEnvelope<BudgetListItem[]>
      >(["budgets", "list"]);
      queryClient.setQueryData<BudgetListItem[] | ApiEnvelope<BudgetListItem[]>>(
        ["budgets", "list"],
        (old) => {
          const optimistic: BudgetListItem = {
            ...newBudget,
            _id: `temp-${Date.now()}`,
            spent: 0,
            totalSpent: 0,
            remaining: newBudget.amount,
            percentageused: "0",
            status: "active",
          };
          if (!old) return [optimistic];
          if (Array.isArray(old)) return [optimistic, ...old];
          return { ...old, data: [optimistic, ...(old.data ?? [])] };
        },
      );
      return { snapshot };
    },

    onError: (error, variables, onMutateResult, mutationContext) => {
      if (onMutateResult?.snapshot !== undefined) {
        queryClient.setQueryData(["budgets", "list"], onMutateResult.snapshot);
      }
      callerOnError?.(error, variables, onMutateResult, mutationContext);
    },

    onSuccess: (data, variables, onMutateResult, mutationContext) => {
      callerOnSuccess?.(data, variables, onMutateResult, mutationContext);
    },

    onSettled: (data, error, variables, onMutateResult, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSettled?.(data, error, variables, onMutateResult, mutationContext);
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
  const { onSuccess: callerOnSuccess, onSettled: callerOnSettled, ...restOptions } = options ?? {};
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
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
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
  const { onSuccess: callerOnSuccess, onSettled: callerOnSettled, ...restOptions } = options ?? {};
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
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
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
  const { onSuccess: callerOnSuccess, onSettled: callerOnSettled, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "archive", budgetId],
    mutationFn: () => {
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.budgets.archiveBudget(budgetId),
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
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
  const { onSuccess: callerOnSuccess, onSettled: callerOnSettled, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["budgets", "restore", budgetId],
    mutationFn: () => {
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.budgets.restoreBudget(budgetId),
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
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
