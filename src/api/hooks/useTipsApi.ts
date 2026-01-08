import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ApiError, apiRequest, fxTipsClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

type FinancialTipResponse = {
  result: string;
  tip: string;
};

export const useGetFinancialTipQuery = (
  amount: number = 500,
  options?: UseQueryOptions<FinancialTipResponse, ApiError>,
) =>
  useQuery<FinancialTipResponse, ApiError>({
    queryKey: ["financial-tip", amount],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.financialTips.getFinancialTips;
      const response = await apiRequest<FinancialTipResponse>(
        {
          method: endpoint.method,
          url: endpoint.path,
          params: { amount },
        },
        fxTipsClient,
      );
      return response;
    },
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 3,
    ...options,
  });
