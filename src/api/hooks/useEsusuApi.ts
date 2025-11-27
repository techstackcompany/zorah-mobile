import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ApiEnvelope,
  ContributeToEsusuRequest,
  CreateEsusuRequest,
  EsusuGroup,
  EsusuPayoutHistoryItem,
  JoinEsusuRequest,
} from "../types";

export const useCreateEsusuGroupMutation = (
  options?: UseMutationOptions<ApiEnvelope<EsusuGroup>, ApiError, CreateEsusuRequest>,
) =>
  useMutation<ApiEnvelope<EsusuGroup>, ApiError, CreateEsusuRequest>({
    mutationKey: ["esusu", "create"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<EsusuGroup>>({
        method: API_ENDPOINTS.esusu.createGroup.method,
        url: API_ENDPOINTS.esusu.createGroup.path,
        data: payload,
      }),
    ...options,
  });

export const useJoinEsusuGroupMutation = (
  options?: UseMutationOptions<ApiEnvelope<EsusuGroup>, ApiError, JoinEsusuRequest>,
) =>
  useMutation<ApiEnvelope<EsusuGroup>, ApiError, JoinEsusuRequest>({
    mutationKey: ["esusu", "join"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<EsusuGroup>>({
        method: API_ENDPOINTS.esusu.joinGroup.method,
        url: API_ENDPOINTS.esusu.joinGroup.path,
        data: payload,
      }),
    ...options,
  });

export const useGetEsusuGroupQuery = (
  groupId: string | undefined,
  options?: UseQueryOptions<ApiEnvelope<EsusuGroup>, ApiError>,
) =>
  useQuery<ApiEnvelope<EsusuGroup>, ApiError>({
    queryKey: ["esusu", "group", groupId],
    queryFn: () => {
      if (!groupId) {
        return Promise.reject<ApiEnvelope<EsusuGroup>>(
          new Error("groupId is required"),
        );
      }
      const endpoint = API_ENDPOINTS.esusu.getGroup(groupId);
      return apiRequest<ApiEnvelope<EsusuGroup>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    enabled: Boolean(groupId),
    ...options,
  });

export const useContributeToEsusuMutation = (
  options?: UseMutationOptions<ApiEnvelope<EsusuGroup>, ApiError, ContributeToEsusuRequest>,
) =>
  useMutation<ApiEnvelope<EsusuGroup>, ApiError, ContributeToEsusuRequest>({
    mutationKey: ["esusu", "contribute"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<EsusuGroup>>({
        method: API_ENDPOINTS.esusu.contribute.method,
        url: API_ENDPOINTS.esusu.contribute.path,
        data: payload,
      }),
    ...options,
  });

export const useProcessEsusuPayoutsMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, void>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, void>({
    mutationKey: ["esusu", "payouts", "process"],
    mutationFn: () =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.esusuPayouts.process.method,
        url: API_ENDPOINTS.esusuPayouts.process.path,
      }),
    ...options,
  });

export const useRetryEsusuPayoutMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, void>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, void>({
    mutationKey: ["esusu", "payouts", "retry"],
    mutationFn: () =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.esusuPayouts.retry.method,
        url: API_ENDPOINTS.esusuPayouts.retry.path,
      }),
    ...options,
  });

export const useGetEsusuPayoutHistoryQuery = (
  groupId: string | undefined,
  options?: UseQueryOptions<ApiEnvelope<EsusuPayoutHistoryItem[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<EsusuPayoutHistoryItem[]>, ApiError>({
    queryKey: ["esusu", "payouts", "history", groupId],
    queryFn: () => {
      if (!groupId) {
        return Promise.reject<ApiEnvelope<EsusuPayoutHistoryItem[]>>(
          new Error("groupId is required"),
        );
      }
      const endpoint = API_ENDPOINTS.esusuPayouts.history(groupId);
      return apiRequest<ApiEnvelope<EsusuPayoutHistoryItem[]>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    enabled: Boolean(groupId),
    ...options,
  });
