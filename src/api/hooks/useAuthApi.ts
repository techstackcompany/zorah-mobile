import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
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

export const useRegisterUserMutation = (
  options?: UseMutationOptions<RegisterUserResponse, ApiError, RegisterUserRequest>,
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
  options?: Partial<UseQueryOptions<ApiEnvelope<UserProfile>, ApiError>>,
) =>
  useQuery<ApiEnvelope<UserProfile>, ApiError>({
    queryKey: ["auth", "profile"],
    queryFn: () =>
      apiRequest<ApiEnvelope<UserProfile>>({
        ...API_ENDPOINTS.auth.profile,
      }),
    ...options,
  });

export const useSetUserPinMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, SetPinRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, SetPinRequest>({
    mutationKey: ["auth", "setPin"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        ...API_ENDPOINTS.auth.setPin,
        data: payload,
      }),
    ...options,
  });

export const useVerifyUserPinMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, VerifyPinRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, VerifyPinRequest>({
    mutationKey: ["auth", "verifyPin"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        ...API_ENDPOINTS.auth.verifyPin,
        data: payload,
      }),
    ...options,
  });

export const useToggleBiometricsMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, ToggleBiometricsRequest>,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, ToggleBiometricsRequest>({
    mutationKey: ["auth", "toggleBiometrics"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        ...API_ENDPOINTS.auth.toggleBiometrics,
        data: payload,
      }),
    ...options,
  });

export const useRequestPasswordResetMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, RequestPasswordResetRequest>,
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
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, ResetPasswordRequest>,
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
  options?: UseMutationOptions<ApiEnvelope<RefreshTokenResponse>, ApiError, RefreshTokenRequest>,
) =>
  useMutation<ApiEnvelope<RefreshTokenResponse>, ApiError, RefreshTokenRequest>({
    mutationKey: ["auth", "refreshToken"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<RefreshTokenResponse>>({
        ...API_ENDPOINTS.auth.refreshToken,
        data: payload,
      }),
    ...options,
  });
