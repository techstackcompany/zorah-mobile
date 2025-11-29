import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosInstance } from "axios";
import { ApiError } from "../client";

const apiClient: AxiosInstance = axios.create({
  baseURL: "https://fx-rates-api.onrender.com",
  headers: {
    Accept: "application/json",
  },
});

type FinancialTipResponse = {
  result: string;
  tip: string;
};

/**
 * Fetch a financial tip from the API.
 */
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
