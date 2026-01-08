import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosInstance } from "axios";
import { ApiError } from "../client";
import { FX_FINANCIAL_TIPS_CONFIG } from "@/src/config/api";

const apiClient: AxiosInstance = axios.create(FX_FINANCIAL_TIPS_CONFIG);

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
      const response = await apiClient.get<FinancialTipResponse>("/tips", {
        params: { amount },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
