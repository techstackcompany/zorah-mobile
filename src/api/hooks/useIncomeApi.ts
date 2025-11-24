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
  AddIncomeRequest,
  ApiEnvelope,
  Income,
} from "../types";

type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<ApiEnvelope<TData>, ApiError, ApiEnvelope<TData>, TQueryKey>,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiEnvelope<TData>, ApiError, TVariables>,
  "mutationFn"
>;

export const useAddIncomeMutation = (
  options?: MutationOptions<Income, AddIncomeRequest>,
) =>
  useMutation<ApiEnvelope<Income>, ApiError, AddIncomeRequest>({
    mutationKey: ["income", "addIncome"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<Income>>({
        method: API_ENDPOINTS.income.addIncome.method,
        url: API_ENDPOINTS.income.addIncome.path,
        data: payload,
      }),
    ...options,
  });

export const useGetIncomesQuery = (
  options?: QueryOptions<Income[]>,
) =>
  useQuery<ApiEnvelope<Income[]>, ApiError>({
    queryKey: ["income", "list"],
    queryFn: async () => {
      const response = await apiRequest<
        | ApiEnvelope<Income[]>
        | Income[]
        | { success: boolean; count: number; data: Income[] }
      >({
        method: API_ENDPOINTS.income.getIncomes.method,
        url: API_ENDPOINTS.income.getIncomes.path,
      });

      // Handle case where API returns { success, count, data }
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        "data" in response
      ) {
        return { data: response.data };
      }

      // Handle case where API returns array directly
      if (Array.isArray(response)) {
        return { data: response };
      }

      // Handle ApiEnvelope format
      return response as ApiEnvelope<Income[]>;
    },
    ...options,
  });

export const useGetIncomeQuery = (
  incomeId: string | undefined,
  options?: QueryOptions<Income>,
) =>
  useQuery<ApiEnvelope<Income>, ApiError>({
    queryKey: ["income", "detail", incomeId],
    queryFn: async () => {
      if (!incomeId) {
        throw new Error("Income ID is required");
      }
      const endpoint = API_ENDPOINTS.income.getIncome(incomeId);
      const response = await apiRequest<
        | ApiEnvelope<Income>
        | Income
        | { success: boolean; data: Income }
      >({
        method: endpoint.method,
        url: endpoint.path,
      });

      // Handle case where API returns { success, data }
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        "data" in response
      ) {
        return { data: response.data };
      }

      // Handle case where API returns object directly
      if (!response || typeof response !== "object" || "data" in response) {
        return response as ApiEnvelope<Income>;
      }

      return { data: response as Income };
    },
    enabled: !!incomeId,
    ...options,
  });

export const useDeleteIncomeMutation = (
  incomeId: string | undefined,
  options?: MutationOptions<ApiEnvelope<{ message: string }>, void>,
) =>
  useMutation<ApiEnvelope<{ message: string }>, ApiError, void>({
    mutationKey: ["income", "delete", incomeId],
    mutationFn: () => {
      if (!incomeId) {
        throw new Error("Income ID is required");
      }
      const endpoint = API_ENDPOINTS.income.deleteIncome(incomeId);
      return apiRequest<ApiEnvelope<{ message: string }>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    ...options,
  });

