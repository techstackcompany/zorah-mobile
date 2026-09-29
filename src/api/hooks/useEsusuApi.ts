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
  ContributeEsusuRequest,
  ContributeEsusuResponse,
  CreateEsusuGroupRequest,
  EsusuGroupResponse,
  EsusuPayoutHistoryResponse,
  JoinEsusuGroupRequest,
  JoinEsusuGroupResponse,
  ProcessEsusuPayoutsResponse,
  RetryEsusuPayoutResponse,
} from "../types";

export const useCreateEsusuGroupMutation = (
  options?: UseMutationOptions<
    EsusuGroupResponse,
    ApiError,
    CreateEsusuGroupRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<EsusuGroupResponse, ApiError, CreateEsusuGroupRequest>({
    mutationKey: ["esusu", "create"],
    mutationFn: (payload) =>
      apiRequest<EsusuGroupResponse>({
        ...API_ENDPOINTS.esusu.create,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["esusu"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

// "Already a member" comes back as a 400, so a repeat join surfaces through
// ApiError/onError rather than this success type.
export const useJoinEsusuGroupMutation = (
  options?: UseMutationOptions<
    JoinEsusuGroupResponse,
    ApiError,
    JoinEsusuGroupRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<JoinEsusuGroupResponse, ApiError, JoinEsusuGroupRequest>({
    mutationKey: ["esusu", "join"],
    mutationFn: (payload) =>
      apiRequest<JoinEsusuGroupResponse>({
        ...API_ENDPOINTS.esusu.join,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["esusu"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

// There is no GET /esusu list-all route on this backend (confirmed 404,
// and absent from the Postman collection) — only get-one by id.
export const useGetEsusuGroupQuery = (
  groupId: string | undefined,
  options?: Partial<UseQueryOptions<EsusuGroupResponse, ApiError>>,
) =>
  useQuery<EsusuGroupResponse, ApiError>({
    queryKey: ["esusu", "detail", groupId ?? ""],
    queryFn: () =>
      apiRequest<EsusuGroupResponse>({
        ...API_ENDPOINTS.esusu.getGroup(groupId ?? ""),
      }),
    enabled: Boolean(groupId),
    ...options,
  });

export const useContributeEsusuMutation = (
  options?: UseMutationOptions<
    ContributeEsusuResponse,
    ApiError,
    ContributeEsusuRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ContributeEsusuResponse, ApiError, ContributeEsusuRequest>({
    mutationKey: ["esusu", "contribute"],
    mutationFn: (payload) =>
      apiRequest<ContributeEsusuResponse>({
        ...API_ENDPOINTS.esusu.contribute,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({
        queryKey: ["esusu", "detail", variables.groupId],
      });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useProcessEsusuPayoutsMutation = (
  options?: UseMutationOptions<ProcessEsusuPayoutsResponse, ApiError, void>,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ProcessEsusuPayoutsResponse, ApiError, void>({
    mutationKey: ["esusu", "payouts", "process"],
    mutationFn: () =>
      apiRequest<ProcessEsusuPayoutsResponse>({
        ...API_ENDPOINTS.esusu.processPayouts,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["esusu"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useRetryEsusuPayoutMutation = (
  options?: UseMutationOptions<RetryEsusuPayoutResponse, ApiError, void>,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<RetryEsusuPayoutResponse, ApiError, void>({
    mutationKey: ["esusu", "payouts", "retry"],
    mutationFn: () =>
      apiRequest<RetryEsusuPayoutResponse>({
        ...API_ENDPOINTS.esusu.retryPayout,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["esusu"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useGetEsusuPayoutHistoryQuery = (
  groupId: string | undefined,
  options?: Partial<UseQueryOptions<EsusuPayoutHistoryResponse, ApiError>>,
) =>
  useQuery<EsusuPayoutHistoryResponse, ApiError>({
    queryKey: ["esusu", "payouts", "history", groupId ?? ""],
    queryFn: () =>
      apiRequest<EsusuPayoutHistoryResponse>({
        ...API_ENDPOINTS.esusu.payoutHistory(groupId ?? ""),
      }),
    enabled: Boolean(groupId),
    ...options,
  });
