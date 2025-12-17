import { FX_CONVERTER_OPTIONS, FX_PAIRS } from "@/constants/fx";
import {
  useGetFxRatePairsQuery,
  useGetFxRatesQuery,
  useGetRateHistoryQuery,
} from "@/src/api/hooks";
import type { FxRatePair } from "@/src/api/types";
import { useCallback, useMemo, useState } from "react";

type CurrencyOption = { code: string; name?: string; flag?: any };

export const useFxRatesScreen = (initialTrend: string = "USDNGN") => {
  const [activeTrend, setActiveTrend] = useState<string>(initialTrend);
  const [converterTab, setConverterTab] = useState<"fx" | "crypto">("fx");
  const [fromCurrency, setFromCurrency] = useState<CurrencyOption>(
    FX_CONVERTER_OPTIONS[0],
  );
  const [toCurrency, setToCurrency] = useState<CurrencyOption>(
    FX_CONVERTER_OPTIONS[1],
  );
  const [amount, setAmount] = useState<string>("0");
  const [showCurrencyModal, setShowCurrencyModal] = useState<{
    type: "from" | "to";
    visible: boolean;
  }>({ type: "from", visible: false });

  const {
    data: usdRates,
    isLoading: isLoadingUsdRates,
    isFetching: isFetchingUsdRates,
    error: usdRatesError,
    refetch: refetchUsdRates,
  } = useGetFxRatesQuery("USD");

  console.log("fx", usdRates, usdRatesError);

  const fxPairsToFetch = useMemo(
    () => [
      { base: "USD", quote: "NGN" },
      { base: "GBP", quote: "NGN" },
      { base: "EUR", quote: "NGN" },
      { base: "CAD", quote: "NGN" },
    ],
    [],
  );

  const {
    data: fxRatePairs,
    isLoading: isLoadingPairs,
    isFetching: isFetchingPairs,
    error: pairsError,
    refetch: refetchPairs,
  } = useGetFxRatePairsQuery(fxPairsToFetch);

  const converterRates = useMemo(() => {
    const rates: Record<string, number> = { NGN: 1 };
    if (usdRates?.conversion_rates) {
      Object.entries(usdRates.conversion_rates).forEach(([k, v]) => {
        rates[k] = v as number;
      });
    }
    return rates;
  }, [usdRates]);

  const fxPairLookup = useMemo(() => {
    const lookup: Record<string, FxRatePair> = {} as any;
    if (fxRatePairs) {
      fxRatePairs.forEach((pair) => {
        const key = `${pair.base}${pair.quote}`;
        lookup[key] = pair as FxRatePair;
      });
    }
    return lookup;
  }, [fxRatePairs]);

  const resolvedFxPairs = useMemo(() => {
    return FX_PAIRS.map((pair) => {
      const key = `${pair.base}${pair.quote}`;
      const apiPair = fxPairLookup[key];
      if (apiPair && typeof apiPair.rate === "number" && apiPair.rate > 0) {
        return {
          ...pair,
          value: apiPair.rate,
          change: apiPair.change ?? 0,
        } as any;
      }
      return { ...pair, value: 0, change: 0 } as any;
    }).filter((p) => p.value > 0);
  }, [fxPairLookup]);

  const trendBase = String(activeTrend).slice(0, 3) || "USD";
  const trendQuote = String(activeTrend).slice(3) || "NGN";

  const {
    data: rateHistory,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useGetRateHistoryQuery(trendBase, trendQuote);

  const activeSeries = useMemo(() => {
    if (!rateHistory || rateHistory.length === 0) return [];
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return rateHistory.slice(-7).map((item: any, index: number) => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();
      const label =
        index === rateHistory.length - 1
          ? "Today"
          : dayLabels[dayIndex] || `Day ${index + 1}`;
      return {
        label,
        value: Number(item.rate || item.value || item.price || 0),
      };
    });
  }, [rateHistory]);

  const lineChartData = useMemo(() => {
    if (!activeSeries.length) return [];
    const lastIndex = activeSeries.length - 1;
    return activeSeries.map((point, index) => ({
      value: point.value,
      label: point.label,
      hideDataPoint: index !== lastIndex,
    }));
  }, [activeSeries]);

  const axisConfig = useMemo(() => {
    const numericValues = activeSeries
      .map((p) => Number(p.value))
      .filter((v) => Number.isFinite(v));
    if (!numericValues.length)
      return {
        labels: [],
        range: undefined as number | undefined,
        offset: undefined as number | undefined,
      };
    let minValue = Math.min(...numericValues);
    let maxValue = Math.max(...numericValues);
    if (minValue === maxValue) {
      const basePadding = Math.max(1, Math.abs(minValue) * 0.05);
      minValue -= basePadding;
      maxValue += basePadding;
    } else {
      const padding = (maxValue - minValue) * 0.1;
      minValue = Math.max(0, minValue - padding);
      maxValue += padding;
    }
    const range = maxValue - minValue;
    return { labels: [], range: range || undefined, offset: minValue };
  }, [activeSeries]);

  const { range: yAxisRange, offset: yAxisOffset } = axisConfig;

  const activeRateValue = useMemo(() => {
    if (!usdRates?.conversion_rates) return 0;
    if (trendBase === "USD" && trendQuote === "NGN")
      return usdRates.conversion_rates.NGN || 0;
    if (trendBase === "GBP" && trendQuote === "NGN") {
      if (usdRates.conversion_rates.GBP && usdRates.conversion_rates.NGN) {
        const gbpToUsd = 1 / usdRates.conversion_rates.GBP;
        return usdRates.conversion_rates.NGN / gbpToUsd;
      }
      return 0;
    }
    if (trendBase === "EUR" && trendQuote === "NGN") {
      if (usdRates.conversion_rates.EUR && usdRates.conversion_rates.NGN) {
        const eurToUsd = 1 / usdRates.conversion_rates.EUR;
        return usdRates.conversion_rates.NGN / eurToUsd;
      }
      return 0;
    }
    return 0;
  }, [usdRates, trendBase, trendQuote]);

  const activeRateChange = useMemo(() => {
    if (!rateHistory || rateHistory.length < 2) return 0;
    const current = Number(rateHistory[rateHistory.length - 1]?.rate || 0);
    const previous = Number(
      rateHistory[rateHistory.length - 2]?.rate || current || 1,
    );
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, [rateHistory]);

  const hasError = Boolean(usdRatesError || pairsError || historyError);
  const isLoading = isLoadingUsdRates || isLoadingPairs || isLoadingHistory;
  const isRefreshing =
    isFetchingUsdRates || isFetchingPairs || isFetchingHistory;

  // Indicates we have cached data but the latest fetch failed (stale data)
  // Only show stale indicator when we have meaningful cached data for
  // what's currently visible: rates list AND chart data for selected trend
  const hasCachedData =
    resolvedFxPairs.length > 0 &&
    activeSeries.length > 0 &&
    activeRateValue > 0;
  const isStale = hasError && hasCachedData && !isRefreshing;

  const handleRefresh = useCallback(() => {
    void refetchUsdRates();
    void refetchPairs();
    void refetchHistory();
  }, [refetchUsdRates, refetchPairs, refetchHistory]);

  const amountValue = useMemo(() => Number(amount || "0") / 100, [amount]);

  const handleAmountChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, 12);
    setAmount(sanitized);
  }, []);

  const convertedValue = useMemo(() => {
    const fromRate = converterRates[fromCurrency.code] ?? 1;
    const toRate = converterRates[toCurrency.code] ?? 1;
    if (!fromRate || !toRate) return 0;
    const baseUsd =
      fromCurrency.code === "USD" ? amountValue : amountValue / fromRate;
    const result = baseUsd * toRate;
    return result;
  }, [amountValue, fromCurrency, toCurrency, converterRates]);

  const formattedAmount = useMemo(
    () => String(amountValue.toFixed(2)),
    [amountValue],
  );
  const toAmount = useMemo(
    () => String(Number(convertedValue).toFixed(2)),
    [convertedValue],
  );

  const fromFlag = fromCurrency.flag;
  const toFlag = toCurrency.flag;

  const lastUpdatedLabel = usdRates?.time_last_update_utc
    ? new Date(usdRates.time_last_update_utc).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

  const handleSelectCurrency = useCallback(
    (code: string) => {
      const selectedOption = FX_CONVERTER_OPTIONS.find(
        (option) => option.code === code,
      );
      if (!selectedOption) return;
      if (showCurrencyModal.type === "from") setFromCurrency(selectedOption);
      else setToCurrency(selectedOption);
    },
    [showCurrencyModal.type],
  );

  return {
    activeTrend,
    setActiveTrend,
    converterTab,
    setConverterTab,
    fromCurrency,
    toCurrency,
    setFromCurrency,
    setToCurrency,
    amount,
    setAmount,
    showCurrencyModal,
    setShowCurrencyModal,
    isLoading,
    isRefreshing,
    isFetchingPairs,
    isFetchingHistory,
    hasError,
    resolvedFxPairs,
    activeSeries,
    lineChartData,
    yAxisRange,
    yAxisOffset,
    activeRateValue,
    activeRateChange,
    lastUpdatedLabel,
    handleRefresh,
    handleAmountChange,
    formattedAmount,
    toAmount,
    fromFlag,
    toFlag,
    handleSelectCurrency,
    isStale,
  } as const;
};

export default useFxRatesScreen;
