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
) =>
  useMutation<ApiEnvelope<SavingsGoal>, ApiError, CreateSavingsGoalRequest>({
    mutationKey: ["savings", "createGoal"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SavingsGoal>>({
        ...API_ENDPOINTS.savings.createGoal,
        data: payload,
      }),
    ...options,
  });

export const useContributeToSavingsMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<SavingsGoal>,
    ApiError,
    ContributeToSavingsRequest
  >,
) =>
  useMutation<ApiEnvelope<SavingsGoal>, ApiError, ContributeToSavingsRequest>({
    mutationKey: ["savings", "contribute"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SavingsGoal>>({
        ...API_ENDPOINTS.savings.contribute,
        data: payload,
      }),
    ...options,
  });

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
) =>
  useMutation<ApiEnvelope<SavingsGoal>, ApiError, UpdateSavingsGoalRequest>({
    mutationKey: ["savings", "updateGoal", goalId],
    mutationFn: (payload) => {
      const endpoint = API_ENDPOINTS.savings.updateGoal(goalId);
      return apiRequest<ApiEnvelope<SavingsGoal>>({
        ...endpoint,
        data: payload,
      });
    },
    ...options,
  });
