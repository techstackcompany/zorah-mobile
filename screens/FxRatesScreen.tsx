import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  CURRENCY_FLAGS,
  formatCurrency,
  FX_CONVERTER_OPTIONS,
  FX_PAIRS,
  FX_TRENDS,
  getChangeColor,
} from "@/constants/fx";
import {
  useGetFxRatePairsQuery,
  useGetFxRatesQuery,
  useGetRateHistoryQuery,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

const CHART_HEIGHT = 160;

const FxRatesScreen = () => {
  const [activeTrend, setActiveTrend] =
    useState<keyof typeof FX_TRENDS>("USDNGN");
  const [converterTab, setConverterTab] = useState<"fx" | "crypto">("fx");
  const [fromCurrency, setFromCurrency] = useState(FX_CONVERTER_OPTIONS[0]);
  const [toCurrency, setToCurrency] = useState(FX_CONVERTER_OPTIONS[1]);
  const [amount, setAmount] = useState("0");
  const [showCurrencyModal, setShowCurrencyModal] = useState<{
    type: "from" | "to";
    visible: boolean;
  }>({ type: "from", visible: false });
  const [chartWidth, setChartWidth] = useState<number>(0);

  const { data: usdRates, isLoading: isLoadingUsdRates } =
    useGetFxRatesQuery("USD");

  const fxPairsToFetch = useMemo(
    () => [
      { base: "USD", quote: "NGN" },
      { base: "GBP", quote: "NGN" },
      { base: "EUR", quote: "NGN" },
      { base: "CAD", quote: "NGN" },
    ],
    [],
  );
  const { data: fxRatePairs, isLoading: isLoadingPairs } =
    useGetFxRatePairsQuery(fxPairsToFetch);

    console.log('fxRatePairs', fxRatePairs)
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
  const { data: rateHistory, isLoading: isLoadingHistory } =
    useGetRateHistoryQuery(trendBase, trendQuote);

  const realFxPairs = useMemo(() => {
    if (!fxRatePairs || fxRatePairs.length === 0) {
      return [];
    }

    return FX_PAIRS.map((pair, index) => {
      const apiPair = fxRatePairs[index];
      if (apiPair && apiPair.rate > 0) {
        return {
          ...pair,
          value: apiPair.rate,
          change: apiPair.change || 0,
        };
      }
      return {
        ...pair,
        value: 0,
        change: 0,
      };
    }).filter((pair) => pair.value > 0);
  }, [fxRatePairs]);

  const activeSeries = useMemo(() => {
    if (!rateHistory || rateHistory.length === 0) {
      return [];
    }

    // Format history for chart (last 7 days)
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return rateHistory.slice(-7).map((item, index) => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();
      const label =
        index === rateHistory.length - 1
          ? "Today"
          : dayLabels[dayIndex] || `Day ${index + 1}`;

      return {
        label,
        value: item.rate,
      };
    });
  }, [rateHistory]);

  // Get active rate value from API data
  const activeRateValue = useMemo(() => {
    if (!usdRates?.conversion_rates) {
      return 0;
    }

    if (trendBase === "USD" && trendQuote === "NGN") {
      return usdRates.conversion_rates.NGN || 0;
    } else if (trendBase === "GBP" && trendQuote === "NGN") {
      // Convert GBP to USD first, then USD to NGN
      if (usdRates.conversion_rates.GBP && usdRates.conversion_rates.NGN) {
        const gbpToUsd = 1 / usdRates.conversion_rates.GBP;
        return usdRates.conversion_rates.NGN / gbpToUsd;
      }
      return 0;
    } else if (trendBase === "EUR" && trendQuote === "NGN") {
      // Convert EUR to USD first, then USD to NGN
      if (usdRates.conversion_rates.EUR && usdRates.conversion_rates.NGN) {
        const eurToUsd = 1 / usdRates.conversion_rates.EUR;
        return usdRates.conversion_rates.NGN / eurToUsd;
      }
      return 0;
    }

    return 0;
  }, [usdRates, trendBase, trendQuote]);

  // Calculate real percentage change from history
  const activeRateChange = useMemo(() => {
    if (!rateHistory || rateHistory.length < 2) {
      return 0; // No change data available yet
    }

    const current = rateHistory[rateHistory.length - 1]?.rate;
    const previous = rateHistory[rateHistory.length - 2]?.rate;

    if (!current || !previous || previous === 0) {
      return 0;
    }

    return ((current - previous) / previous) * 100;
  }, [rateHistory]);

  const isLoading = isLoadingUsdRates || isLoadingPairs || isLoadingHistory;

  const amountValue = useMemo(() => Number(amount || "0") / 100, [amount]);

  const handleAmountChange = useCallback(
    (value: string) => {
      const digitsOnly = value.replace(/\D/g, "");
      const nextValue = digitsOnly.replace(/^0+(?=\d)/, "") || "0";
      setAmount(nextValue);
    },
    [setAmount],
  );
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
    () =>
      formatCurrency(Number(convertedValue), toCurrency.code).replace(
        "NGN",
        "₦",
      ),
    [convertedValue, toCurrency.code],
  );
  const fromFlag = fromCurrency.flag ?? CURRENCY_FLAGS[fromCurrency.code];
  const toFlag = toCurrency.flag ?? CURRENCY_FLAGS[toCurrency.code];

  const lineChartData = useMemo(() => {
    if (activeSeries.length === 0) {
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
      return { labels: [] as string[], range: undefined, offset: undefined };
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
    const sections = 4;
    const step = range / sections || 1;
    const labels = Array.from({ length: sections + 1 }, (_, index) => {
      const value = minValue + step * index;
      return formatCurrency(value, "NGN").replace(/^NGN[\s\u00a0]?/, "₦");
    });

    return { labels, range: range || undefined, offset: minValue };
  }, [activeSeries]);
  const { range: yAxisRange, offset: yAxisOffsetValue } = axisConfig;

  const changeColor = getChangeColor(activeRateChange);
  const changeBackground = activeRateChange >= 0 ? "#E9F7EC" : "#FFE6EA";
  const chartSpacing =
    chartWidth > 0 && lineChartData.length > 1
      ? (chartWidth - 70) / (lineChartData.length - 1)
      : 30;

  if (isLoading) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-textColor/60">
            Loading exchange rates...
          </Text>
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.summaryCard]}>
          <View>
            <Text weight="medium" className="text-xl text-textColor/50">
              {activeTrend.slice(0, 3)}/{activeTrend.slice(3)}
            </Text>
            <Text weight="bold" className="mt-3 text-3xl text-textColor">
              {activeRateValue > 0 ? (
                <>
                  ₦
                  {activeRateValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </>
              ) : (
                "--"
              )}
            </Text>
          </View>
          <View style={styles.summaryRight}>
            <View
              style={[
                styles.changeBadge,
                { backgroundColor: changeBackground },
              ]}
            >
              <Text
                weight="semibold"
                className="ml-1 text-xs"
                style={{ color: changeColor }}
              >
                {activeRateChange >= 0 ? "+" : ""}
                {activeRateChange.toFixed(2)}%
              </Text>
            </View>
            <View style={[styles.changeRow, { marginTop: 8 }]}>
              <Ionicons
                name={activeRateChange >= 0 ? "trending-up" : "trending-down"}
                size={14}
                color={activeRateChange >= 0 ? COLORS.secondary_500 : "#D83A56"}
              />
              <Text className="ms-1 text-xs text-textColor/60">
                24hr change
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: COLORS.primary_100 }]}>
          <View style={styles.tabRow}>
            <Text className="me-4">Rates Trends</Text>
            {["USDNGN", "GBPNGN", "EURNGN"].map((trend) => {
              const isActive = trend === activeTrend;
              return (
                <Pressable
                  key={trend}
                  onPress={() =>
                    setActiveTrend(trend as keyof typeof FX_TRENDS)
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[styles.trendChip, isActive && styles.trendChipActive]}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={`text-xs ${isActive ? "text-white" : "text-textColor/60"}`}
                  >
                    {trend.length === 6
                      ? `${trend.slice(0, 3)}/${trend.slice(3)}`
                      : trend}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View
            style={styles.chartWrapper}
            onLayout={({ nativeEvent: { layout } }) =>
              setChartWidth(layout.width)
            }
          >
            {activeSeries.length > 0 ? (
              <LineChart
                height={CHART_HEIGHT}
                showVerticalLines
                hideRules
                verticalLinesUptoDataPoint
                dataPointsColor={COLORS.grayLight}
                data={lineChartData}
                spacing={chartSpacing}
                width={chartWidth - 35 || undefined}
                animateOnDataChange
                xAxisThickness={0}
                yAxisThickness={0}
                curved
                thickness={2.5}
                color={COLORS.primary_400}
                rulesColor={COLORS.grayLight}
                xAxisLabelTexts={activeSeries.map((point) => point.label)}
                xAxisLabelTextStyle={styles.chartLabelText}
                yAxisTextStyle={styles.chartLabelText}
                maxValue={yAxisRange}
                yAxisOffset={yAxisOffsetValue}
                formatYLabel={formatYLabel}
                xAxisTextNumberOfLines={1}
              />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text className="text-sm text-textColor/60">
                  Chart data will appear as rates are tracked over time
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text weight="semibold" className="mb-2 text-base text-textColor">
            Currency Converter
          </Text>

          <View style={[styles.converterField]}>
            <View style={[{ flex: 1 }]}>
              <Text className="text-sm text-textColor">From</Text>
              <TextInput
                value={formattedAmount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                className="text-textColor/70"
                style={styles.input}
                placeholderTextColor="#A0A8B2"
              />
            </View>
            <Pressable
              style={styles.currencySelect}
              onPress={() =>
                setShowCurrencyModal({ type: "from", visible: true })
              }
              accessibilityRole="button"
            >
              {fromFlag ? (
                <Image
                  source={fromFlag}
                  style={styles.currencySelectFlag}
                  contentFit="cover"
                />
              ) : null}
              <Text weight="semibold" className="text-sm text-textColor">
                {fromCurrency.code}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
            </Pressable>
          </View>

          <View style={styles.swapRow}>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.swapButton}
              onPress={() => {
                setFromCurrency(toCurrency);
                setToCurrency(fromCurrency);
              }}
            >
              <Ionicons
                name="swap-vertical"
                size={24}
                color={COLORS.primary_400}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.converterField}>
            <View style={{ flex: 1 }}>
              <Text className="text-sm text-textColor">To</Text>
              <TextInput
                editable={false}
                value={toAmount}
                style={[styles.input]}
                className="text-textColor/70"
              />
            </View>
            <Pressable
              style={styles.currencySelect}
              onPress={() =>
                setShowCurrencyModal({ type: "to", visible: true })
              }
              accessibilityRole="button"
            >
              {toFlag ? (
                <Image
                  source={toFlag}
                  style={styles.currencySelectFlag}
                  contentFit="cover"
                />
              ) : null}
              <Text weight="semibold" className="text-sm text-textColor">
                {toCurrency.code}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
            </Pressable>
          </View>
          <View className="mt-4 flex-row items-center gap-3">
            <Image
              source={require("@/assets/icons/clock.svg")}
              style={{ width: 16, height: 16 }}
            />
            <Text className="text-sm text-textColor/50">
              Rates Updated:{" "}
              {usdRates?.time_last_update_utc
                ? new Date(usdRates.time_last_update_utc).toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit" },
                  )
                : new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.segmentWrapper}>
            <Pressable
              style={[
                styles.segmentButton,
                converterTab === "fx" ? styles.segmentButtonActive : null,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: converterTab === "fx" }}
              onPress={() => setConverterTab("fx")}
            >
              <Text
                weight={converterTab === "fx" ? "semibold" : "medium"}
                className={`text-sm ${converterTab === "fx" ? "text-textColor" : "text-textColor/60"}`}
              >
                FX Rates
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentButton,
                converterTab === "crypto" ? styles.segmentButtonActive : null,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: converterTab === "crypto" }}
              onPress={() => setConverterTab("crypto")}
            >
              <Text
                weight={converterTab === "crypto" ? "semibold" : "medium"}
                className={`text-sm ${converterTab === "crypto" ? "text-textColor" : "text-textColor/60"}`}
              >
                Crypto
              </Text>
            </Pressable>
          </View>

          {converterTab === "fx" ? (
            <View style={{ marginTop: 16 }}>
              <Text className="text-xs text-textColor/50">Fiat Currency</Text>
              <View style={{ marginTop: 16 }}>
                {realFxPairs.length > 0 ? (
                  realFxPairs.map((pair, index) => {
                    const isLast = index === realFxPairs.length - 1;
                    const baseFlag = CURRENCY_FLAGS[pair.base];
                    const quoteFlag = CURRENCY_FLAGS[pair.quote];
                    return (
                      <View
                        key={pair.id}
                        style={[
                          styles.rateRow,
                          !isLast
                            ? {
                                borderBottomWidth: 1,
                                borderBottomColor: "#EEF1F6",
                              }
                            : null,
                        ]}
                      >
                        <View style={styles.rateRowLeft}>
                          <View style={styles.flagStack}>
                            {baseFlag ? (
                              <Image
                                source={baseFlag}
                                style={[styles.flagImage, styles.flagPrimary]}
                                contentFit="cover"
                              />
                            ) : null}
                            {quoteFlag ? (
                              <Image
                                source={quoteFlag}
                                style={[styles.flagImage, styles.flagSecondary]}
                                contentFit="cover"
                              />
                            ) : null}
                          </View>
                          <View>
                            <Text
                              weight="semibold"
                              className="text-sm text-textColor"
                            >
                              {pair.label}
                            </Text>
                            <Text className="text-xs text-textColor/50">
                              {pair.base}/{pair.quote}
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            weight="semibold"
                            className="text-sm text-textColor"
                          >
                            {pair.value.toLocaleString()}
                          </Text>
                          <View style={styles.changeRow}>
                            <Ionicons
                              name={
                                pair.change >= 0 ? "arrow-up" : "arrow-down"
                              }
                              size={12}
                              color={getChangeColor(pair.change)}
                            />
                            <Text
                              className="ml-1 text-xs"
                              style={{ color: getChangeColor(pair.change) }}
                            >
                              {pair.change >= 0 ? "+" : ""}
                              {pair.change.toFixed(2)}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <Text className="text-sm text-textColor/60">
                      No exchange rate data available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.cryptoPlaceholder}>
              <Text className="text-sm text-textColor/60">
                Crypto market data will appear here soon.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <SlideUpModal
        visible={showCurrencyModal.visible}
        onClose={() => setShowCurrencyModal({ type: "from", visible: false })}
        title="Select Currency"
        headerBackgroundColor="#1643F5"
        headerTextColor="#FFFFFF"
      >
        <View className="space-y-2">
          {FX_CONVERTER_OPTIONS.map((option) => {
            const isSelected =
              (showCurrencyModal.type === "from"
                ? fromCurrency.code
                : toCurrency.code) === option.code;
            const optionFlag = option.flag;
            return (
              <Pressable
                key={option.code}
                style={styles.modalRow}
                accessibilityRole="button"
                onPress={() => {
                  if (showCurrencyModal.type === "from") {
                    setFromCurrency(option);
                  } else {
                    setToCurrency(option);
                  }
                  setShowCurrencyModal({
                    type: showCurrencyModal.type,
                    visible: false,
                  });
                }}
              >
                {optionFlag ? (
                  <Image
                    source={optionFlag}
                    style={styles.modalFlag}
                    contentFit="cover"
                  />
                ) : null}
                <View style={styles.modalText}>
                  <Text weight="semibold" className="text-sm text-textColor">
                    {option.code}
                  </Text>
                  <Text className="text-xs text-textColor/60">
                    {option.name}
                  </Text>
                </View>
                <SelectionDot selected={isSelected} />
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>
    </MainContainer>
  );
};

const SelectionDot = ({ selected }: { selected: boolean }) => (
  <View
    style={[
      styles.selectionDot,
      { borderColor: selected ? COLORS.primary_400 : "#D1D6DE" },
    ]}
  >
    {selected ? <View style={styles.selectionDotInner} /> : null}
  </View>
);

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
  summaryCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 3,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "white",
    padding: 20,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  trendChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  trendChipActive: {
    backgroundColor: COLORS.primary_400,
  },

  chartWrapper: {
    alignItems: "stretch",
    marginTop: 20,
  },
  chartLabelText: {
    fontSize: 10,
    color: COLORS.textColor,
  },
  activePoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
  },
  activePointInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary_400,
  },
  activePointLabel: {
    backgroundColor: COLORS.primary_400,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  converterField: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  input: {
    marginTop: 14,
    fontSize: 26,
    fontFamily: "NunitoBold",
    width: "100%",
  },
  currencySelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 12,
    backgroundColor: COLORS.grayLight,
    position: "absolute",
    right: 8,
    top: 8,
  },
  currencySelectFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  swapButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F4FD",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  segmentWrapper: {
    flexDirection: "row",
    backgroundColor: "#EEF1F6",
    borderRadius: 999,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  segmentButtonActive: {
    backgroundColor: "white",
  },
  rateRow: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rateRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flagStack: {
    width: 38,
    height: 26,
    position: "relative",
  },
  flagImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  flagPrimary: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  flagSecondary: {
    position: "absolute",
    left: 14,
    top: 0,
  },
  changeRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  cryptoPlaceholder: {
    marginTop: 20,
    paddingVertical: 30,
    borderRadius: 18,
    backgroundColor: "#F4F7FF",
    alignItems: "center",
  },
  modalRow: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalFlag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  modalText: {
    flex: 1,
  },
  selectionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  selectionDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary_400,
  },
  chartPlaceholder: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FxRatesScreen;
