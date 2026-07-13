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
  DepositFundsRequest,
  DepositFundsResponse,
  VerifyAccountResponse,
  WalletBalance,
  WalletBanksResponse,
  WalletDetails,
  WalletOverviewResponse,
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
        ...API_ENDPOINTS.wallet.getOrCreate,
      }),
    ...options,
  });

export const useDepositFundsMutation = (
  options?: UseMutationOptions<
    DepositFundsResponse,
    ApiError,
    DepositFundsRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<DepositFundsResponse, ApiError, DepositFundsRequest>({
    mutationKey: ["wallet", "deposit"],
    mutationFn: (payload) =>
      apiRequest<DepositFundsResponse>({
        ...API_ENDPOINTS.wallet.deposit,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useWithdrawFundsMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<WalletDetails>,
    ApiError,
    WithdrawFundsRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<ApiEnvelope<WalletDetails>, ApiError, WithdrawFundsRequest>({
    mutationKey: ["wallet", "withdraw"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<WalletDetails>>({
        ...API_ENDPOINTS.wallet.withdraw,
        data: payload,
      }),
    ...restOptions,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
      callerOnSuccess?.(data, variables, context, mutationContext);
    },
  });
};

export const useGetWalletBalanceQuery = (
  options?: UseQueryOptions<ApiEnvelope<WalletBalance>, ApiError>,
) =>
  useQuery<ApiEnvelope<WalletBalance>, ApiError>({
    queryKey: ["wallet", "balance"],
    queryFn: () =>
      apiRequest<ApiEnvelope<WalletBalance>>({
        ...API_ENDPOINTS.wallet.balance,
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
        ...API_ENDPOINTS.wallet.transactions,
      });
      if (
        response &&
        typeof response === "object" &&
        "transactions" in response &&
        Array.isArray(response.transactions)
      ) {
        return { data: response.transactions };
      }

      return response as ApiEnvelope<WalletTransaction[]>;
    },
    ...options,
  });

export const useGetWalletBanksQuery = (
  options?: UseQueryOptions<WalletBanksResponse, ApiError>,
) =>
  useQuery<WalletBanksResponse, ApiError>({
    queryKey: ["wallet", "banks"],
    queryFn: () =>
      apiRequest<WalletBanksResponse>({
        ...API_ENDPOINTS.wallet.banks,
      }),
    // The bank list rarely changes; keep it fresh for a day.
    staleTime: 24 * 60 * 60 * 1000,
    ...options,
  });

export const useVerifyBankAccountQuery = (
  bankCode: string | undefined,
  accountNumber: string,
  options?: Partial<UseQueryOptions<VerifyAccountResponse, ApiError>>,
) =>
  useQuery<VerifyAccountResponse, ApiError>({
    queryKey: ["wallet", "verify-account", bankCode ?? "", accountNumber],
    queryFn: () =>
      apiRequest<VerifyAccountResponse>({
        ...API_ENDPOINTS.wallet.verifyAccount(bankCode ?? "", accountNumber),
      }),
    // Only fire once we have a bank and a complete 10-digit account number.
    enabled: Boolean(bankCode) && /^\d{10}$/.test(accountNumber),
    // The backend answers 500 for unresolvable accounts; retrying won't help.
    retry: false,
    ...options,
  });

export const useWalletOverViewQuery = (
  options?: UseQueryOptions<WalletOverviewResponse, ApiError>,
) =>
  useQuery({
    queryKey: ["wallet", "overview"],
    queryFn: () =>
      apiRequest<WalletOverviewResponse>({
        ...API_ENDPOINTS.wallet.overview,
      }),
    ...options,
  });
