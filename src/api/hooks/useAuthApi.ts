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
  LoginUserRequest,
  LoginUserResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  SetPinRequest,
  SetPinResponse,
  ToggleBiometricsRequest,
  ToggleBiometricsResponse,
  UpdateOnboardingRequest,
  UpdateProfileRequest,
  UserProfile,
  VerifyPinRequest,
  VerifyPinResponse,
} from "../types";

export const useRegisterUserMutation = (
  options?: UseMutationOptions<
    RegisterUserResponse,
    ApiError,
    RegisterUserRequest
  >,
) =>
  useMutation<RegisterUserResponse, ApiError, RegisterUserRequest>({
    mutationKey: ["auth", "register"],
    mutationFn: (payload) =>
      apiRequest<RegisterUserResponse>({
        ...API_ENDPOINTS.auth.register,
        data: payload,
      }),
    ...options,
  });

export const useLoginUserMutation = (
  options?: UseMutationOptions<LoginUserResponse, ApiError, LoginUserRequest>,
) =>
  useMutation<LoginUserResponse, ApiError, LoginUserRequest>({
    mutationKey: ["auth", "login"],
    mutationFn: (payload) =>
      apiRequest<LoginUserResponse>({
        ...API_ENDPOINTS.auth.login,
        data: payload,
      }),
    ...options,
  });

export const useGetUserProfileQuery = (
  options?: Partial<UseQueryOptions<UserProfile, ApiError>>,
) =>
  useQuery<UserProfile, ApiError>({
    queryKey: ["auth", "profile"],
    queryFn: () =>
      apiRequest<UserProfile>({
        ...API_ENDPOINTS.auth.profile,
      }),
    ...options,
  });

export const useUpdateProfileMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<unknown>,
    ApiError,
    UpdateProfileRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<unknown>, ApiError, UpdateProfileRequest>({
    mutationKey: ["auth", "updateProfile"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        ...API_ENDPOINTS.auth.updateProfile,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useUpdateOnboardingMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<unknown>,
    ApiError,
    UpdateOnboardingRequest
  >,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, UpdateOnboardingRequest>({
    mutationKey: ["auth", "onboarding"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        ...API_ENDPOINTS.auth.onboarding,
        data: payload,
      }),
    ...options,
  });

export const useSetUserPinMutation = (
  options?: UseMutationOptions<SetPinResponse, ApiError, SetPinRequest>,
) =>
  useMutation<SetPinResponse, ApiError, SetPinRequest>({
    mutationKey: ["auth", "setPin"],
    mutationFn: (payload) =>
      apiRequest<SetPinResponse>({
        ...API_ENDPOINTS.auth.setPin,
        data: payload,
      }),
    ...options,
  });

export const useVerifyUserPinMutation = (
  options?: UseMutationOptions<VerifyPinResponse, ApiError, VerifyPinRequest>,
) =>
  useMutation<VerifyPinResponse, ApiError, VerifyPinRequest>({
    mutationKey: ["auth", "verifyPin"],
    mutationFn: (payload) =>
      apiRequest<VerifyPinResponse>({
        ...API_ENDPOINTS.auth.verifyPin,
        data: payload,
      }),
    ...options,
  });

export const useToggleBiometricsMutation = (
  options?: UseMutationOptions<
    ToggleBiometricsResponse,
    ApiError,
    ToggleBiometricsRequest
  >,
) =>
  useMutation<ToggleBiometricsResponse, ApiError, ToggleBiometricsRequest>({
    mutationKey: ["auth", "toggleBiometrics"],
    mutationFn: (payload) =>
      apiRequest<ToggleBiometricsResponse>({
        ...API_ENDPOINTS.auth.toggleBiometrics,
        data: payload,
      }),
    ...options,
  });

export const useRequestPasswordResetMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<unknown>,
    ApiError,
    RequestPasswordResetRequest
  >,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, RequestPasswordResetRequest>({
    mutationKey: ["auth", "requestReset"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        ...API_ENDPOINTS.auth.requestPasswordReset,
        data: payload,
      }),
    ...options,
  });

export const useResetPasswordMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<unknown>,
    ApiError,
    ResetPasswordRequest
  >,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, ResetPasswordRequest>({
    mutationKey: ["auth", "resetPassword"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        ...API_ENDPOINTS.auth.resetPassword,
        data: payload,
      }),
    ...options,
  });

export const useRefreshAccessTokenMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<RefreshTokenResponse>,
    ApiError,
    RefreshTokenRequest
  >,
) =>
  useMutation<ApiEnvelope<RefreshTokenResponse>, ApiError, RefreshTokenRequest>(
    {
      mutationKey: ["auth", "refreshToken"],
      mutationFn: (payload) =>
        apiRequest<ApiEnvelope<RefreshTokenResponse>>({
          ...API_ENDPOINTS.auth.refreshToken,
          data: payload,
        }),
      ...options,
    },
  );
