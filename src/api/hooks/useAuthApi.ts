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
  LoginUserRequest,
  LoginUserResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  SetPinRequest,
  ToggleBiometricsRequest,
  UserProfile,
  VerifyPinRequest,
} from "../types";

type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<ApiEnvelope<TData>, ApiError, ApiEnvelope<TData>, TQueryKey>,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiEnvelope<TData>, ApiError, TVariables>,
  "mutationFn"
>;

export const useRegisterUserMutation = (
  options?: Omit<
    UseMutationOptions<RegisterUserResponse, ApiError, RegisterUserRequest>,
    "mutationFn"
  >,
) =>
  useMutation<RegisterUserResponse, ApiError, RegisterUserRequest>({
    mutationKey: ["auth", "register"],
    mutationFn: (payload) =>
      apiRequest<RegisterUserResponse>({
        method: API_ENDPOINTS.auth.register.method,
        url: API_ENDPOINTS.auth.register.path,
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
        method: API_ENDPOINTS.auth.login.method,
        url: API_ENDPOINTS.auth.login.path,
        data: payload,
      }),
    ...options,
  });

export const useGetUserProfileQuery = (
  options?: QueryOptions<UserProfile>,
) =>
  useQuery<ApiEnvelope<UserProfile>, ApiError>({
    queryKey: ["auth", "profile"],
    queryFn: () =>
      apiRequest<ApiEnvelope<UserProfile>>({
        method: API_ENDPOINTS.auth.profile.method,
        url: API_ENDPOINTS.auth.profile.path,
      }),
    ...options,
  });

export const useSetUserPinMutation = (
  options?: MutationOptions<unknown, SetPinRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, SetPinRequest>({
    mutationKey: ["auth", "setPin"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.auth.setPin.method,
        url: API_ENDPOINTS.auth.setPin.path,
        data: payload,
      }),
    ...options,
  });

export const useVerifyUserPinMutation = (
  options?: MutationOptions<unknown, VerifyPinRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, VerifyPinRequest>({
    mutationKey: ["auth", "verifyPin"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.auth.verifyPin.method,
        url: API_ENDPOINTS.auth.verifyPin.path,
        data: payload,
      }),
    ...options,
  });

export const useToggleBiometricsMutation = (
  options?: MutationOptions<unknown, ToggleBiometricsRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, ToggleBiometricsRequest>({
    mutationKey: ["auth", "toggleBiometrics"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.auth.toggleBiometrics.method,
        url: API_ENDPOINTS.auth.toggleBiometrics.path,
        data: payload,
      }),
    ...options,
  });

export const useRequestPasswordResetMutation = (
  options?: MutationOptions<unknown, RequestPasswordResetRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, RequestPasswordResetRequest>({
    mutationKey: ["auth", "requestReset"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.auth.requestPasswordReset.method,
        url: API_ENDPOINTS.auth.requestPasswordReset.path,
        data: payload,
      }),
    ...options,
  });

export const useResetPasswordMutation = (
  options?: MutationOptions<unknown, ResetPasswordRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, ResetPasswordRequest>({
    mutationKey: ["auth", "resetPassword"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.auth.resetPassword.method,
        url: API_ENDPOINTS.auth.resetPassword.path,
        data: payload,
      }),
    ...options,
  });

export const useRefreshAccessTokenMutation = (
  options?: MutationOptions<RefreshTokenResponse, RefreshTokenRequest>,
) =>
  useMutation<ApiEnvelope<RefreshTokenResponse>, ApiError, RefreshTokenRequest>({
    mutationKey: ["auth", "refreshToken"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<RefreshTokenResponse>>({
        method: API_ENDPOINTS.auth.refreshToken.method,
        url: API_ENDPOINTS.auth.refreshToken.path,
        data: payload,
      }),
    ...options,
  });
