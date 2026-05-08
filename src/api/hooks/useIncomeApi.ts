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
  AddIncomeRequest,
  ApiEnvelope,
  GetIncomesResponse,
  Income,
  UpdateIncomeRequest,
} from "../types";

export const useAddIncomeMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<Income>,
    ApiError,
    AddIncomeRequest,
    { snapshot: GetIncomesResponse | undefined }
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
    ApiEnvelope<Income>,
    ApiError,
    AddIncomeRequest,
    { snapshot: GetIncomesResponse | undefined }
  >({
    mutationKey: ["income", "addIncome"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<Income>>({
        ...API_ENDPOINTS.income.addIncome,
        data: payload,
      }),
    ...restOptions,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["income", "list"] });
      const snapshot = queryClient.getQueryData<GetIncomesResponse>([
        "income",
        "list",
      ]);
      queryClient.setQueryData<GetIncomesResponse>(
        ["income", "list"],
        (old) => {
          const optimistic: Income = {
            ...variables,
            _id: `temp-${Date.now()}`,
            user: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          if (!old) {
            return { success: true, count: 1, data: [optimistic] };
          }
          const newData = [optimistic, ...(old.data ?? [])];
          return { ...old, count: newData.length, data: newData };
        },
      );
      return { snapshot };
    },

    onError: (error, variables, context, mutationContext) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData(["income", "list"], context.snapshot);
      }
      callerOnError?.(error, variables, context, mutationContext);
    },

    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },

    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["income"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
    },
  });
};

export const useGetIncomesQuery = (
  options?: Partial<UseQueryOptions<GetIncomesResponse, ApiError>>,
) =>
  useQuery<GetIncomesResponse, ApiError>({
    queryKey: ["income", "list"],
    queryFn: async () => {
      const response = await apiRequest<GetIncomesResponse>({
        ...API_ENDPOINTS.income.getIncomes,
      });
      return response;
    },
    ...options,
  });

export const useGetIncomeQuery = (
  incomeId: string,
  options?: Partial<UseQueryOptions<ApiEnvelope<Income>, ApiError>>,
) =>
  useQuery<ApiEnvelope<Income>, ApiError>({
    queryKey: ["income", "detail", incomeId],
    queryFn: async () => {
      return apiRequest<ApiEnvelope<Income>>({
        ...API_ENDPOINTS.income.getIncome(incomeId),
      });
    },
    enabled: !!incomeId,
    ...options,
  });

export const useDeleteIncomeMutation = (
  incomeId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: callerOnSuccess,
    onSettled: callerOnSettled,
    ...restOptions
  } = options ?? {};
  return useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["income", "delete", incomeId],
    mutationFn: () => {
      if (!incomeId) {
        throw new Error("Income ID is required");
      }
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.income.deleteIncome(incomeId),
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["income"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
    },
  });
};

export const useUpdateIncomeMutation = (
  incomeId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<Income>,
    ApiError,
    UpdateIncomeRequest
  >,
) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: callerOnSuccess,
    onSettled: callerOnSettled,
    ...restOptions
  } = options ?? {};
  return useMutation<ApiEnvelope<Income>, ApiError, UpdateIncomeRequest>({
    mutationKey: ["income", "update", incomeId],
    mutationFn: (payload) => {
      if (!incomeId) {
        throw new Error("Income ID is required");
      }
      const endpoint = API_ENDPOINTS.income.editIncome(incomeId);
      return apiRequest<ApiEnvelope<Income>>({
        ...endpoint,
        data: payload,
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["income"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
    },
  });
};
