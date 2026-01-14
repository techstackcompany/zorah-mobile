import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { ApiError, apiRequest, fxTipsClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  FxHistoricalData,
  FxPairQuote,
  FxRatePair,
  FxRateResponse,
} from "../types";

const DEFAULT_HISTORY_DAYS = 7;
const ONE_DAY = 1000 * 60 * 60 * 24;

const timeConfig = {
  staleTime: ONE_DAY,
  refetchInterval: ONE_DAY,
};

export const useGetFxRatesQuery = (
  baseCurrency: string = "USD",
  options?: UseQueryOptions<FxRateResponse, ApiError>,
) =>
  useQuery<FxRateResponse, ApiError>({
    queryKey: ["fx-rates", baseCurrency],
    queryFn: async () => {
      const response = await apiRequest<FxRateResponse>({
        ...API_ENDPOINTS.fx.rates,
        params: { base: baseCurrency },
      }, fxTipsClient);

      return {
        ...response,
        conversion_rates: response.conversion_rates || {},
      };
    },
    ...timeConfig,
    ...options,
  });


export const useGetFxRatePairQuery = (
  baseCurrency: string,
  quoteCurrency: string,
  options?: UseQueryOptions<FxPairQuote, ApiError>,
) =>
  useQuery<FxPairQuote, ApiError>({
    queryKey: ["fx-rate-pair", baseCurrency, quoteCurrency],
    queryFn: async () => {
      const response = await apiRequest<{ pair: FxPairQuote }>({
        ...API_ENDPOINTS.fx.pair,
        params: { base: baseCurrency, target: quoteCurrency },
      }, fxTipsClient);

      return response.pair;
    },
    ...timeConfig,
    enabled: !!baseCurrency && !!quoteCurrency,
    ...options,
  });


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

      const response = await apiRequest<{ pairs: FxRatePair[] }>({
        ...API_ENDPOINTS.fx.pairs,
        params: { pairs: pairsParam },
      }, fxTipsClient);

      return response.pairs || [];
    },
    ...timeConfig,
    enabled: pairs.length > 0,
    ...options,
  });


export const useGetRateHistoryQuery = (
  baseCurrency: string,
  quoteCurrency: string,
  options?: UseQueryOptions<FxHistoricalData[], ApiError>,
) =>
  useQuery<FxHistoricalData[], ApiError>({
    queryKey: ["fx-rate-history", baseCurrency, quoteCurrency],
    queryFn: async () => {
      const response = await apiRequest<{ history: FxHistoricalData[] }>({
        ...API_ENDPOINTS.fx.history,
        params: {
          base: baseCurrency,
          quote: quoteCurrency,
          days: DEFAULT_HISTORY_DAYS,
        },
      }, fxTipsClient);

      return response.history || [];
    },
    ...timeConfig,
    enabled: !!baseCurrency && !!quoteCurrency,
    ...options,
  });
