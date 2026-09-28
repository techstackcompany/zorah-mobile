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
  WithdrawFundsResponse,
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

/**
 * Bank payout. Validates the transaction PIN server-side and moves money, so
 * the caller must treat a 400 naming "PIN" as a retryable wrong-PIN rather
 * than a generic failure.
 *
 * The success shape is still PROVISIONAL — every probe so far has been
 * rejected at PIN validation, so `WithdrawFundsResponse` is typed from what
 * the app needs rather than from an observed response. Firm it up from the
 * first real transfer.
 */
export const useWithdrawFundsMutation = (
  options?: UseMutationOptions<
    WithdrawFundsResponse,
    ApiError,
    WithdrawFundsRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess: callerOnSuccess, ...restOptions } = options ?? {};
  return useMutation<WithdrawFundsResponse, ApiError, WithdrawFundsRequest>({
    mutationKey: ["wallet", "withdraw"],
    mutationFn: (payload) =>
      apiRequest<WithdrawFundsResponse>({
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

// Returns the figures flat: { status, balance, ledgerBalance }. This was typed
// as ApiEnvelope<WalletBalance> (i.e. data.balance) while every consumer read
// balanceData?.balance — it only compiled because ApiEnvelope has an index
// signature, and it would have rendered ₦0 had anyone trusted the type.
export const useGetWalletBalanceQuery = (
  options?: UseQueryOptions<WalletBalance, ApiError>,
) =>
  useQuery<WalletBalance, ApiError>({
    queryKey: ["wallet", "balance"],
    queryFn: () =>
      apiRequest<WalletBalance>({
        ...API_ENDPOINTS.wallet.balance,
      }),
    ...options,
  });

export const useGetWalletTransactionsQuery = (
  options?: UseQueryOptions<ApiEnvelope<WalletTransaction[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<WalletTransaction[]>, ApiError>({
    queryKey: ["wallet", "transactions"],
    // See notes/wallet-transactions-shape.md (local, gitignored) for history.
    queryFn: async () => {
      const response = await apiRequest<unknown>({
        ...API_ENDPOINTS.wallet.transactions,
      });

      const pickList = (node: unknown): WalletTransaction[] | null => {
        if (Array.isArray(node)) return node as WalletTransaction[];
        if (!node || typeof node !== "object") return null;
        const record = node as Record<string, unknown>;
        if (Array.isArray(record.transactions)) {
          return record.transactions as WalletTransaction[];
        }
        return null;
      };

      const record =
        response && typeof response === "object"
          ? (response as Record<string, unknown>)
          : {};

      const list = pickList(record) ?? pickList(record.data) ?? [];
      const pagination = (record.data as Record<string, unknown> | undefined)
        ?.pagination;

      return {
        data: list,
        ...(pagination ? { pagination } : {}),
      } as ApiEnvelope<WalletTransaction[]>;
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
    enabled: Boolean(bankCode) && /^\d{10}$/.test(accountNumber),
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
