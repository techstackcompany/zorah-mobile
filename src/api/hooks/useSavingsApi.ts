import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { apiRequest, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ApiEnvelope,
  ContributeToSavingsRequest,
  CreateSavingsGoalRequest,
  SavingsGoal,
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
  useMutation<
    ApiEnvelope<SavingsGoal>,
    ApiError,
    ContributeToSavingsRequest
  >({
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
    queryFn: () =>
      apiRequest<ApiEnvelope<SavingsGoal[]>>({
        method: API_ENDPOINTS.savings.getGoals.method,
        url: API_ENDPOINTS.savings.getGoals.path,
      }),
    ...options,
  });
