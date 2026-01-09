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
  GetIncomesResponse,
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
  options?: UseQueryOptions<GetIncomesResponse, ApiError>,
) =>
  useQuery<GetIncomesResponse, ApiError>({
    queryKey: ["income", "list"],
    queryFn: async () => {
      const response = await apiRequest<GetIncomesResponse>({
        ...API_ENDPOINTS.income.getIncomes,
      });

      return response;
    },
    ...options,
  });

export const useGetIncomeQuery = (
  incomeId: string,
  options?: UseQueryOptions<ApiEnvelope<Income>, ApiError>,
) =>
  useQuery<ApiEnvelope<Income>, ApiError>({
    queryKey: ["income", "detail", incomeId],
    queryFn: async () => {
      return apiRequest<ApiEnvelope<Income>>({
        ...API_ENDPOINTS.income.getIncome(incomeId),
      });
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
      return apiRequest<ApiEnvelope<{ message: string }>>({
        ...API_ENDPOINTS.income.deleteIncome(incomeId),
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
