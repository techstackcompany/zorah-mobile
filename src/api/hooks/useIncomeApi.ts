import {
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
  UpdateIncomeRequest,
} from "../types";

export const useAddIncomeMutation = (
  options?: UseMutationOptions<ApiEnvelope<Income>, ApiError, AddIncomeRequest>,
) =>
  useMutation<ApiEnvelope<Income>, ApiError, AddIncomeRequest>({
    mutationKey: ["income", "addIncome"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<Income>>({
        ...API_ENDPOINTS.income.addIncome,
        data: payload,
      }),
    ...options,
  });

export const useGetIncomesQuery = (
  options?: UseQueryOptions<ApiEnvelope<Income[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<Income[]>, ApiError>({
    queryKey: ["income", "list"],
    queryFn: async () => {
      const response = await apiRequest<
        | ApiEnvelope<Income[]>
        | Income[]
        | { success: boolean; count: number; data: Income[] }
      >({
        ...API_ENDPOINTS.income.getIncomes,
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
  options?: Partial<UseQueryOptions<ApiEnvelope<Income>, ApiError>>,
) =>
  useQuery<ApiEnvelope<Income>, ApiError>({
    queryKey: ["income", "detail", incomeId],
    queryFn: async () => {
      if (!incomeId) {
        throw new Error("Income ID is required");
      }
      const endpoint = API_ENDPOINTS.income.getIncome(incomeId);
      const response = await apiRequest<
        ApiEnvelope<Income> | Income | { success: boolean; data: Income }
      >({
        ...endpoint,
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
  options?: UseMutationOptions<
    ApiEnvelope<{ message: string }>,
    ApiError,
    void
  >,
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
export const useUpdateIncomeMutation = (
  incomeId: string | undefined,
  options?: UseMutationOptions<
    ApiEnvelope<Income>,
    ApiError,
    UpdateIncomeRequest
  >,
) =>
  useMutation<ApiEnvelope<Income>, ApiError, UpdateIncomeRequest>({
    mutationKey: ["income", "update", incomeId],
    mutationFn: (payload) => {
      if (!incomeId) {
        throw new Error("Income ID is required");
      }
      const endpoint = API_ENDPOINTS.income.editIncome(incomeId);
      return apiRequest<ApiEnvelope<Income>>({
        ...endpoint,
        data: payload,
      });
    },
    ...options,
  });
