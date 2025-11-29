import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import MainContainer from "@/components/layouts/MainContainer";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  CURRENCY_FLAGS,
  FX_CONVERTER_OPTIONS,
  FX_PAIRS,
  FX_TRENDS,
  formatCurrency,
} from "@/constants/fx";
import FxChartCard from "@/components/fx/FxChartCard";
import FxConverterCard from "@/components/fx/FxConverterCard";
import FxRatesList from "@/components/fx/FxRatesList";
import CurrencySelectModal from "@/components/fx/CurrencySelectModal";
import FxSummaryCard from "@/components/fx/FxSummaryCard";
import { useGetFxRatePairsQuery, useGetFxRatesQuery, useGetRateHistoryQuery } from "@/src/api/hooks";
import type { FxRatePair } from "@/src/api/types";

const FxRatesScreen = () => {
  const [activeTrend, setActiveTrend] = useState<keyof typeof FX_TRENDS>("USDNGN");
  const [converterTab, setConverterTab] = useState<"fx" | "crypto">("fx");
  const [fromCurrency, setFromCurrency] = useState(FX_CONVERTER_OPTIONS[0]);
  const [toCurrency, setToCurrency] = useState(FX_CONVERTER_OPTIONS[1]);
  const [amount, setAmount] = useState("0");
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

    if (!usdRates?.conversion_rates) {
      return rates;
    }

    const usdRatesData = usdRates.conversion_rates;
    if (usdRatesData.NGN) {
      rates.USD = usdRatesData.NGN;
    }

    if (usdRatesData.GBP && usdRatesData.NGN) {
      rates.GBP = usdRatesData.NGN / usdRatesData.GBP;
    }

    if (usdRatesData.EUR && usdRatesData.NGN) {
      rates.EUR = usdRatesData.NGN / usdRatesData.EUR;
    }

    if (usdRatesData.CAD && usdRatesData.NGN) {
      rates.CAD = usdRatesData.NGN / usdRatesData.CAD;
    }

    return rates;
  }, [usdRates]);

  const trendBase = activeTrend.slice(0, 3);
  const trendQuote = activeTrend.slice(3);
  const {
    data: rateHistory,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useGetRateHistoryQuery(trendBase, trendQuote);

  const fxPairLookup = useMemo(() => {
    const lookup: { [key: string]: FxRatePair } = {};

    if (fxRatePairs) {
      fxRatePairs.forEach((pair) => {
        const key = `${pair.base}${pair.quote}`;
        lookup[key] = pair;
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
        };
      }

      return {
        ...pair,
        value: 0,
        change: 0,
      };
    }).filter((pair) => pair.value > 0);
  }, [fxPairLookup]);

  const activeSeries = useMemo(() => {
    if (!rateHistory || rateHistory.length === 0) {
      return [];
    }

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return rateHistory.slice(-7).map((item, index) => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();
      const label =
        index === rateHistory.length - 1 ? "Today" : dayLabels[dayIndex] || `Day ${index + 1}`;

      return {
        label,
        value: item.rate,
      };
    });
  }, [rateHistory]);

  const lineChartData = useMemo(() => {
    if (!activeSeries.length) {
      return [];
    }
    const lastIndex = activeSeries.length - 1;
    return activeSeries.map((point, index) => ({
      value: point.value,
      label: point.label,
      hideDataPoint: index !== lastIndex,
    }));
  }, [activeSeries]);

  const axisConfig = useMemo(() => {
    const numericValues = activeSeries
      .map((point) => Number(point.value))
      .filter((value) => Number.isFinite(value));

    if (!numericValues.length) {
      return { labels: [] as string[], range: undefined as number | undefined, offset: undefined as number | undefined };
    }

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

  const { range: yAxisRange, offset: yAxisOffsetValue } = axisConfig;

  const activeRateValue = useMemo(() => {
    if (!usdRates?.conversion_rates) {
      return 0;
    }

    if (trendBase === "USD" && trendQuote === "NGN") {
      return usdRates.conversion_rates.NGN || 0;
    } else if (trendBase === "GBP" && trendQuote === "NGN") {
      if (usdRates.conversion_rates.GBP && usdRates.conversion_rates.NGN) {
        const gbpToUsd = 1 / usdRates.conversion_rates.GBP;
        return usdRates.conversion_rates.NGN / gbpToUsd;
      }
      return 0;
    } else if (trendBase === "EUR" && trendQuote === "NGN") {
      if (usdRates.conversion_rates.EUR && usdRates.conversion_rates.NGN) {
        const eurToUsd = 1 / usdRates.conversion_rates.EUR;
        return usdRates.conversion_rates.NGN / eurToUsd;
      }
      return 0;
    }

    return 0;
  }, [usdRates, trendBase, trendQuote]);

  const activeRateChange = useMemo(() => {
    if (!rateHistory || rateHistory.length < 2) {
      return 0;
    }

    const current = rateHistory[rateHistory.length - 1]?.rate;
    const previous = rateHistory[rateHistory.length - 2]?.rate;

    if (!current || !previous || previous === 0) {
      return 0;
    }

    return ((current - previous) / previous) * 100;
  }, [rateHistory]);

  const hasError = Boolean(usdRatesError || pairsError || historyError);
  const isLoading = isLoadingUsdRates || isLoadingPairs || isLoadingHistory;
  const isRefreshing = isFetchingUsdRates || isFetchingPairs || isFetchingHistory;

  const hasUsdRates = Boolean(usdRates);
  const hasPairs = resolvedFxPairs.length > 0;
  const hasHistory = Boolean(rateHistory && rateHistory.length > 0);
  const showInitialLoader = !hasUsdRates && !hasPairs && !hasHistory && isLoading;

  const handleRefresh = useCallback(() => {
    refetchUsdRates();
    refetchPairs();
    refetchHistory();
  }, [refetchUsdRates, refetchPairs, refetchHistory]);

  const amountValue = useMemo(() => Number(amount || "0") / 100, [amount]);

  const handleAmountChange = useCallback(
    (value: string) => {
      const digitsOnly = value.replace(/\D/g, "");
      const nextValue = digitsOnly.replace(/^0+(?=\d)/, "") || "0";
      setAmount(nextValue);
    },
    [setAmount],
  );

  const formattedAmount = useMemo(() => {
    const formatted = formatCurrency(amountValue, fromCurrency.code);
    return formatted.replace(/\u00a0/g, " ");
  }, [amountValue, fromCurrency]);

  const convertedValue = useMemo(() => {
    const fromRate = converterRates[fromCurrency.code];
    const toRate = converterRates[toCurrency.code];
    if (!fromRate || !toRate) {
      return "0.00";
    }
    if (!Number.isFinite(amountValue)) {
      return "0.00";
    }
    const valueInNaira = amountValue * fromRate;
    const converted = valueInNaira / toRate;
    return converted.toFixed(2);
  }, [amountValue, fromCurrency, toCurrency, converterRates]);

  const toAmount = useMemo(
    () => formatCurrency(Number(convertedValue), toCurrency.code).replace("NGN", "₦"),
    [convertedValue, toCurrency.code],
  );

  const fromFlag = fromCurrency.flag ?? CURRENCY_FLAGS[fromCurrency.code];
  const toFlag = toCurrency.flag ?? CURRENCY_FLAGS[toCurrency.code];

  const lastUpdatedLabel = usdRates?.time_last_update_utc
    ? new Date(usdRates.time_last_update_utc).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

  const formatYLabel = (label: string) => {
    const num = Number(label);
    if (!Number.isFinite(num)) return "";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
    })
      .format(num)
      .replace("NGN", "₦")
      .replace(/\u00A0/, " ");
  };

  const handleSelectCurrency = useCallback(
    (code: string) => {
      const selectedOption = FX_CONVERTER_OPTIONS.find((option) => option.code === code);
      if (!selectedOption) return;

      if (showCurrencyModal.type === "from") {
        setFromCurrency(selectedOption);
      } else {
        setToCurrency(selectedOption);
      }
    },
    [showCurrencyModal.type],
  );

  if (showInitialLoader) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-textColor/60">Loading exchange rates...</Text>
        </View>
      </MainContainer>
    );
  }

  if (hasError) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.loadingContainer}>
          <Text className="text-base text-textColor/70">
            Could not load exchange rates. Please try again.
          </Text>
          <View className="mt-4 w-full px-8">
            <PrimaryButton label="Retry" onPress={handleRefresh} />
          </View>
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <FxSummaryCard
          pairLabel={`${activeTrend.slice(0, 3)}/${activeTrend.slice(3)}`}
          rateValue={activeRateValue}
          changePercent={activeRateChange}
        />

        <FxChartCard
          activeTrend={activeTrend}
          onSelectTrend={setActiveTrend}
          activeSeries={activeSeries}
          lineChartData={lineChartData}
          isFetchingHistory={isFetchingHistory}
          yAxisRange={yAxisRange}
          yAxisOffset={yAxisOffsetValue}
          formatYLabel={formatYLabel}
        />

        <FxConverterCard
          formattedAmount={formattedAmount}
          toAmount={toAmount}
          onAmountChange={handleAmountChange}
          fromCurrencyCode={fromCurrency.code}
          toCurrencyCode={toCurrency.code}
          fromFlag={fromFlag}
          toFlag={toFlag}
          onOpenFromCurrency={() => setShowCurrencyModal({ type: "from", visible: true })}
          onOpenToCurrency={() => setShowCurrencyModal({ type: "to", visible: true })}
          onSwap={() => {
            setFromCurrency(toCurrency);
            setToCurrency(fromCurrency);
          }}
          lastUpdatedLabel={lastUpdatedLabel}
        />

        <FxRatesList
          converterTab={converterTab}
          onChangeTab={setConverterTab}
          pairs={resolvedFxPairs}
          isFetching={isFetchingPairs}
        />
      </ScrollView>

      <CurrencySelectModal
        visible={showCurrencyModal.visible}
        type={showCurrencyModal.type}
        onClose={() => setShowCurrencyModal({ type: "from", visible: false })}
        onSelect={handleSelectCurrency}
        activeFrom={fromCurrency.code}
        activeTo={toCurrency.code}
      />
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
});

export default FxRatesScreen;
