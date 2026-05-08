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
  ContributeToSavingsRequest,
  CreateSavingsGoalRequest,
  SavingsGoal,
  UpdateSavingsGoalRequest,
} from "../types";

export const useCreateSavingsGoalMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<SavingsGoal>,
    ApiError,
    CreateSavingsGoalRequest
  >,
) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: callerOnSuccess,
    onSettled: callerOnSettled,
    ...restOptions
  } = options ?? {};
  return useMutation<ApiEnvelope<SavingsGoal>, ApiError, CreateSavingsGoalRequest>({
    mutationKey: ["savings", "createGoal"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SavingsGoal>>({
        ...API_ENDPOINTS.savings.createGoal,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["savings"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
    },
  });
};

export const useContributeToSavingsMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<SavingsGoal>,
    ApiError,
    ContributeToSavingsRequest,
    { snapshot: ApiEnvelope<SavingsGoal> | undefined }
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
    ApiEnvelope<SavingsGoal>,
    ApiError,
    ContributeToSavingsRequest,
    { snapshot: ApiEnvelope<SavingsGoal> | undefined }
  >({
    mutationKey: ["savings", "contribute"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SavingsGoal>>({
        ...API_ENDPOINTS.savings.contribute,
        data: payload,
      }),
    ...restOptions,

    onMutate: async (variables) => {
      const { goalId, amount } = variables;
      await queryClient.cancelQueries({
        queryKey: ["savings", "goal", goalId],
      });
      const snapshot = queryClient.getQueryData<ApiEnvelope<SavingsGoal>>([
        "savings",
        "goal",
        goalId,
      ]);
      queryClient.setQueryData<ApiEnvelope<SavingsGoal>>(
        ["savings", "goal", goalId],
        (old) => {
          if (!old?.data) return old;
          const optimisticContribution = {
            _id: `temp-${Date.now()}`,
            amount,
            date: new Date().toISOString(),
          };
          return {
            ...old,
            data: {
              ...old.data,
              currentAmount: (old.data.currentAmount ?? 0) + amount,
              fundingHistory: [
                ...(old.data.fundingHistory ?? []),
                optimisticContribution,
              ],
            },
          };
        },
      );
      return { snapshot };
    },

    onError: (error, variables, context, mutationContext) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData(
          ["savings", "goal", variables.goalId],
          context.snapshot,
        );
      }
      callerOnError?.(error, variables, context, mutationContext);
    },

    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },

    onSettled: (data, error, variables, context, mutationContext) => {
      // Contributions affect both the savings goal and wallet balance.
      void queryClient.invalidateQueries({ queryKey: ["savings"] });
      void queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
    },
  });
};

export const useGetSavingsGoalsQuery = (
  options?: Partial<UseQueryOptions<SavingsGoal[], ApiError>>,
) =>
  useQuery<SavingsGoal[], ApiError>({
    queryKey: ["savings", "goals"],
    queryFn: async () => {
      const response = await apiRequest<SavingsGoal[]>({
        ...API_ENDPOINTS.savings.getGoals,
      });
      return response;
    },
    ...options,
  });

export const useGetSavingsGoalQuery = (
  goalId: string | undefined,
  options?: UseQueryOptions<ApiEnvelope<SavingsGoal>, ApiError>,
) =>
  useQuery<ApiEnvelope<SavingsGoal>, ApiError>({
    queryKey: ["savings", "goal", goalId],
    queryFn: async () => {
      if (!goalId) {
        throw new Error("Goal ID is required");
      }
      const endpoint = API_ENDPOINTS.savings.getGoal(goalId);
      const response = await apiRequest<ApiEnvelope<SavingsGoal> | SavingsGoal>(
        {
          ...endpoint,
        },
      );

      
      if (!response || typeof response !== "object" || "data" in response) {
        
        return response as ApiEnvelope<SavingsGoal>;
      }

      
      return { data: response as SavingsGoal };
    },
    enabled: !!goalId,
    ...options,
  });

export const useUpdateSavingsGoalMutation = (
  goalId: string,
  options?: UseMutationOptions<
    ApiEnvelope<SavingsGoal>,
    ApiError,
    UpdateSavingsGoalRequest
  >,
) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: callerOnSuccess,
    onSettled: callerOnSettled,
    ...restOptions
  } = options ?? {};
  return useMutation<ApiEnvelope<SavingsGoal>, ApiError, UpdateSavingsGoalRequest>({
    mutationKey: ["savings", "updateGoal", goalId],
    mutationFn: (payload) => {
      const endpoint = API_ENDPOINTS.savings.updateGoal(goalId);
      return apiRequest<ApiEnvelope<SavingsGoal>>({
        ...endpoint,
        data: payload,
      });
    },
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["savings"] });
      callerOnSettled?.(data, error, variables, context, mutationContext);
    },
  });
};
