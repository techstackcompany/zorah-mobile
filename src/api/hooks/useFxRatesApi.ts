import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { ApiError,  } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  FxHistoricalData,
  FxPairQuote,
  FxPairsResponse,
  FxRatePair,
  FxRateResponse,
} from "../types";
import axios, { AxiosInstance } from "axios";

const DEFAULT_HISTORY_DAYS = 7;
const ONE_DAY = 1000 * 60 * 60 * 24;

 const apiClient: AxiosInstance  = axios.create({
  baseURL: "https://seal-app-jjgmw.ondigitalocean.app",
  headers: {
    Accept: "application/json",
  },
});
/**
 * Fetch current exchange rates for a base currency from the proxy API
 */
export const useGetFxRatesQuery = (
  baseCurrency: string = "USD",
  options?: UseQueryOptions<FxRateResponse, ApiError>,
) =>
  useQuery<FxRateResponse, ApiError>({
    queryKey: ["fx-rates", baseCurrency],
    queryFn: async () => {
      const response = await apiClient.get<FxRateResponse>(
        API_ENDPOINTS.fx.rates.path,
        {
          params: { base: baseCurrency },
        },
      );

      return {
        ...response.data,
        conversion_rates: response.data.conversion_rates || {},
      };
    },
    staleTime: ONE_DAY,
    refetchInterval: ONE_DAY,
    ...options,
  });

/**
 * Get a specific exchange rate pair
 */
export const useGetFxRatePairQuery = (
  baseCurrency: string,
  quoteCurrency: string,
  options?: UseQueryOptions<FxPairQuote, ApiError>,
) =>
  useQuery<FxPairQuote, ApiError>({
    queryKey: ["fx-rate-pair", baseCurrency, quoteCurrency],
    queryFn: async () => {
      const response = await apiClient.get<{ pair: FxPairQuote }>(
        API_ENDPOINTS.fx.pair.path,
        {
          params: { base: baseCurrency, target: quoteCurrency },
        },
      );

      return response.data.pair;
    },

    staleTime: ONE_DAY,
    refetchInterval: ONE_DAY,
    enabled: !!baseCurrency && !!quoteCurrency,
    ...options,
  });



/**
 * Get multiple exchange rate pairs at once with change calculations
 */
type FxRatePairQueryResponse = FxRatePair[];
type FxRatePairRequest = {
  base: string;
  quote: string;
};
export const useGetFxRatePairsQuery = (
  pairs: FxRatePairRequest[],
  options?: UseQueryOptions<FxRatePairQueryResponse, ApiError>,
) =>
  useQuery<FxRatePairQueryResponse, ApiError>({
    queryKey: ["fx-rate-pairs", JSON.stringify(pairs)],
    queryFn: async () => {
      const pairsParam = pairs
        .map((pair) => `${pair.base}:${pair.quote}`)
        .join(",");

      const response = await apiClient.get(
        API_ENDPOINTS.fx.pairs.path,
        {
          params: { pairs: pairsParam },
        },
      );

      return response.data.pairs || [];
    },
    staleTime: ONE_DAY,
    refetchInterval: ONE_DAY,
    enabled: pairs.length > 0,
    ...options,
  });


  
/**
 * Get rate history for a currency pair (for charts) from the proxy API
 */
export const useGetRateHistoryQuery = (
  baseCurrency: string,
  quoteCurrency: string,
  options?: UseQueryOptions<FxHistoricalData[], ApiError>,
) =>
  useQuery<FxHistoricalData[], ApiError>({
    queryKey: ["fx-rate-history", baseCurrency, quoteCurrency],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.fx.history.path, {
        params: {
          base: baseCurrency,
          quote: quoteCurrency,
          days: DEFAULT_HISTORY_DAYS,
        },
      });

      return response.data.history || [];
    },
    staleTime: ONE_DAY,
    enabled: !!baseCurrency && !!quoteCurrency,
    ...options,
  });
