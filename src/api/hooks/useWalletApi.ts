import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ApiEnvelope,
  DepositFundsRequest,
  WalletBalance,
  WalletDetails,
  WalletTransaction,
  WithdrawFundsRequest,
} from "../types";

export const useGetOrCreateWalletQuery = (
  options?: UseQueryOptions<ApiEnvelope<WalletDetails>, ApiError>,
) =>
  useQuery<ApiEnvelope<WalletDetails>, ApiError>({
    queryKey: ["wallet", "details"],
    queryFn: () =>
      apiRequest<ApiEnvelope<WalletDetails>>({
        method: API_ENDPOINTS.wallet.getOrCreate.method,
        url: API_ENDPOINTS.wallet.getOrCreate.path,
      }),
    ...options,
  });

export const useDepositFundsMutation = (
  options?: UseMutationOptions<ApiEnvelope<WalletDetails>, ApiError, DepositFundsRequest>,
) =>
  useMutation<ApiEnvelope<WalletDetails>, ApiError, DepositFundsRequest>({
    mutationKey: ["wallet", "deposit"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<WalletDetails>>({
        method: API_ENDPOINTS.wallet.deposit.method,
        url: API_ENDPOINTS.wallet.deposit.path,
        data: payload,
      }),
    ...options,
  });

export const useWithdrawFundsMutation = (
  options?: UseMutationOptions<ApiEnvelope<WalletDetails>, ApiError, WithdrawFundsRequest>,
) =>
  useMutation<ApiEnvelope<WalletDetails>, ApiError, WithdrawFundsRequest>({
    mutationKey: ["wallet", "withdraw"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<WalletDetails>>({
        method: API_ENDPOINTS.wallet.withdraw.method,
        url: API_ENDPOINTS.wallet.withdraw.path,
        data: payload,
      }),
    ...options,
  });

export const useGetWalletBalanceQuery = (
  options?: UseQueryOptions<ApiEnvelope<WalletBalance>, ApiError>,
) =>
  useQuery<ApiEnvelope<WalletBalance>, ApiError>({
    queryKey: ["wallet", "balance"],
    queryFn: () =>
      apiRequest<ApiEnvelope<WalletBalance>>({
        method: API_ENDPOINTS.wallet.balance.method,
        url: API_ENDPOINTS.wallet.balance.path,
      }),
    ...options,
  });

export const useGetWalletTransactionsQuery = (
  options?: UseQueryOptions<ApiEnvelope<WalletTransaction[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<WalletTransaction[]>, ApiError>({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      const response = await apiRequest<
        | ApiEnvelope<WalletTransaction[]>
        | { success: boolean; transactions: WalletTransaction[] }
      >({
        method: API_ENDPOINTS.wallet.transactions.method,
        url: API_ENDPOINTS.wallet.transactions.path,
      });

      // Handle { success: true, transactions: [...] } structure
      if (
        response &&
        typeof response === "object" &&
        "transactions" in response &&
        Array.isArray(response.transactions)
      ) {
        return { data: response.transactions };
      }

      // Handle ApiEnvelope structure
      return response as ApiEnvelope<WalletTransaction[]>;
    },
    ...options,
  });

export const useWalletHealthQuery = (
  options?: UseQueryOptions<ApiEnvelope<unknown>, ApiError>,
) =>
  useQuery<ApiEnvelope<unknown>, ApiError>({
    queryKey: ["wallet", "health"],
    queryFn: () =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.wallet.healthCheck.method,
        url: API_ENDPOINTS.wallet.healthCheck.path,
      }),
    ...options,
  });
