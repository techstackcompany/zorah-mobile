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
  ContributeToSavingsRequest,
  CreateSavingsGoalRequest,
  SavingsGoal,
  UpdateSavingsGoalRequest,
} from "../types";

type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<ApiEnvelope<TData>, ApiError, ApiEnvelope<TData>, TQueryKey>,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiEnvelope<TData>, ApiError, TVariables>,
  "mutationFn"
>;

export const useCreateSavingsGoalMutation = (
  options?: MutationOptions<SavingsGoal, CreateSavingsGoalRequest>,
) =>
  useMutation<ApiEnvelope<SavingsGoal>, ApiError, CreateSavingsGoalRequest>({
    mutationKey: ["savings", "createGoal"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SavingsGoal>>({
        method: API_ENDPOINTS.savings.createGoal.method,
        url: API_ENDPOINTS.savings.createGoal.path,
        data: payload,
      }),
    ...options,
  });

export const useContributeToSavingsMutation = (
  options?: MutationOptions<SavingsGoal, ContributeToSavingsRequest>,
) =>
  useMutation<ApiEnvelope<SavingsGoal>, ApiError, ContributeToSavingsRequest>({
    mutationKey: ["savings", "contribute"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SavingsGoal>>({
        method: API_ENDPOINTS.savings.contribute.method,
        url: API_ENDPOINTS.savings.contribute.path,
        data: payload,
      }),
    ...options,
  });

export const useGetSavingsGoalsQuery = (
  options?: QueryOptions<SavingsGoal[]>,
) =>
  useQuery<ApiEnvelope<SavingsGoal[]>, ApiError>({
    queryKey: ["savings", "goals"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<SavingsGoal[]> | SavingsGoal[]
      >({
        method: API_ENDPOINTS.savings.getGoals.method,
        url: API_ENDPOINTS.savings.getGoals.path,
      });

      // Handle case where API returns array directly
      if (Array.isArray(response)) {
        return { data: response };
      }

      return response;
    },
    ...options,
  });

export const useGetSavingsGoalQuery = (
  goalId: string | undefined,
  options?: QueryOptions<SavingsGoal>,
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
          method: endpoint.method,
          url: endpoint.path,
        },
      );

      // Handle case where API returns object directly
      if (!response || typeof response !== "object" || "data" in response) {
        // It's already an ApiEnvelope
        return response as ApiEnvelope<SavingsGoal>;
      }

      // Wrap direct object in ApiEnvelope
      return { data: response as SavingsGoal };
    },
    enabled: !!goalId,
    ...options,
  });

export const useUpdateSavingsGoalMutation = (
  goalId: string,
  options?: MutationOptions<SavingsGoal, UpdateSavingsGoalRequest>,
) =>
  useMutation<ApiEnvelope<SavingsGoal>, ApiError, UpdateSavingsGoalRequest>({
    mutationKey: ["savings", "updateGoal", goalId],
    mutationFn: (payload) => {
      const endpoint = API_ENDPOINTS.savings.updateGoal(goalId);
      return apiRequest<ApiEnvelope<SavingsGoal>>({
        method: endpoint.method,
        url: endpoint.path,
        data: payload,
      });
    },
    ...options,
  });
