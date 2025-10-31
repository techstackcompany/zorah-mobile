import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  FX_CONVERTER_OPTIONS,
  FX_PAIRS,
  FX_TRENDS,
  formatCurrency,
  getChangeColor,
} from "@/constants/fx";
import SlideUpModal from "@/components/ui/SlideUpModal";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";

const CHART_HEIGHT = 160;
const CHART_WIDTH = 260;
const CONVERTER_BASE_RATES: Record<string, number> = {
  NGN: 1,
  USD: 1456,
  GBP: 1840,
  EUR: 1620,
  CAD: 1100,
};

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

  const activeSeries = FX_TRENDS[activeTrend];
  const HEADLINE_CHANGE: Record<string, number> = {
    USDNGN: 1.23,
    GBPNGN: 0.89,
    EURNGN: -0.35,
  };
  const activeRateValue = activeSeries[activeSeries.length - 1]?.value ?? 1456;
  const activeRateChange = HEADLINE_CHANGE[activeTrend] ?? 1.23;

  const convertedValue = useMemo(() => {
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) {
      return "0.00";
    }
    const fromRate = CONVERTER_BASE_RATES[fromCurrency.code];
    const toRate = CONVERTER_BASE_RATES[toCurrency.code];
    if (!fromRate || !toRate) {
      return "0.00";
    }
    const valueInNaira = numericAmount * fromRate;
    const converted = valueInNaira / toRate;
    return converted.toFixed(2);
  }, [amount, fromCurrency, toCurrency]);

  const chartPoints = useMemo(() => {
    const values = activeSeries.map((point) => point.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return activeSeries
      .map((point, index) => {
        const x = (index / (activeSeries.length - 1)) * CHART_WIDTH;
        const normalized = (point.value - min) / (max - min || 1);
        const y = CHART_HEIGHT - normalized * CHART_HEIGHT;
        return `${x},${y}`;
      })
      .join(" ");
  }, [activeSeries]);

  const changeColor = getChangeColor(activeRateChange);
  const changeBackground =
    activeRateChange >= 0 ? "#E9F7EC" : "#FFE6EA";

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.summaryCard}>
          <View>
            <Text className="text-sm text-textColor/60">FX Rate</Text>
            <Text weight="bold" className="mt-1 text-2xl text-textColor">
              {activeTrend.slice(0, 3)}/{activeTrend.slice(3)}
            </Text>
            <Text weight="bold" className="mt-3 text-3xl text-textColor">
              ₦{activeRateValue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRight}>
            <View style={[styles.changeBadge, { backgroundColor: changeBackground }]}>
              <Ionicons
                name={activeRateChange >= 0 ? "arrow-up" : "arrow-down"}
                size={14}
                color={changeColor}
              />
              <Text weight="semibold" className="ml-1 text-xs" style={{ color: changeColor }}>
                {activeRateChange >= 0 ? "+" : ""}
                {activeRateChange.toFixed(2)}%
              </Text>
            </View>
            <Text className="mt-2 text-xs text-textColor/60">24hr change</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            {(Object.keys(FX_TRENDS) as Array<keyof typeof FX_TRENDS>).map((trend) => {
              const isActive = trend === activeTrend;
              return (
                <Pressable
                  key={trend}
                  onPress={() => setActiveTrend(trend)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.trendChip,
                    isActive ? styles.trendChipActive : styles.trendChipInactive,
                  ]}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={`text-xs ${isActive ? "text-white" : "text-textColor/60"}`}
                  >
                    {trend}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.chartWrapper}>
            <Svg height={CHART_HEIGHT} width={CHART_WIDTH}>
              <Polyline
                points={chartPoints}
                fill="none"
                stroke="#2D5BFF"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.chartLabels}>
            {activeSeries.map((point) => (
              <Text key={point.label} className="text-[10px] text-textColor/50">
                {point.label}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text weight="semibold" className="text-base text-textColor">
            Currency Converter
          </Text>

          <View style={styles.converterField}>
            <View style={{ flex: 1 }}>
              <Text className="text-xs text-textColor/50">From</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#A0A8B2"
              />
            </View>
            <Pressable
              style={styles.currencySelect}
              onPress={() => setShowCurrencyModal({ type: "from", visible: true })}
              accessibilityRole="button"
            >
              <Text weight="semibold" className="text-sm text-textColor">
                {fromCurrency.code}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
            </Pressable>
          </View>

          <View style={styles.swapRow}>
            <View style={styles.divider} />
            <Pressable
              accessibilityRole="button"
              style={styles.swapButton}
              onPress={() => {
                setFromCurrency(toCurrency);
                setToCurrency(fromCurrency);
              }}
            >
              <Ionicons name="swap-vertical" size={16} color={COLORS.primary_400} />
            </Pressable>
            <View style={styles.divider} />
          </View>

          <View style={styles.converterField}>
            <View style={{ flex: 1 }}>
              <Text className="text-xs text-textColor/50">To</Text>
              <TextInput
                editable={false}
                value={formatCurrency(Number(convertedValue), toCurrency.code)}
                style={[styles.input, { color: COLORS.textColor }]}
              />
            </View>
            <Pressable
              style={styles.currencySelect}
              onPress={() => setShowCurrencyModal({ type: "to", visible: true })}
              accessibilityRole="button"
            >
              <Text weight="semibold" className="text-sm text-textColor">
                {toCurrency.code}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
            </Pressable>
          </View>

          <Text className="mt-4 text-xs text-textColor/50">
            Rates Updated: 21:15
          </Text>
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
                className={`text-sm ${converterTab === "fx" ? "text-white" : "text-textColor/60"}`}
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
                className={`text-sm ${converterTab === "crypto" ? "text-white" : "text-textColor/60"}`}
              >
                Crypto
              </Text>
            </Pressable>
          </View>

          {converterTab === "fx" ? (
            <View style={{ marginTop: 16 }}>
              <Text className="text-xs text-textColor/50">Fiat Currency</Text>
              <View style={{ marginTop: 16 }}>
                {FX_PAIRS.map((pair, index) => {
                  const isLast = index === FX_PAIRS.length - 1;
                  return (
                    <View
                      key={pair.id}
                      style={[
                        styles.rateRow,
                        !isLast ? { borderBottomWidth: 1, borderBottomColor: "#EEF1F6" } : null,
                      ]}
                    >
                      <View>
                        <Text weight="semibold" className="text-sm text-textColor">
                          {pair.label}
                        </Text>
                        <Text className="text-xs text-textColor/50">
                          {pair.base}/{pair.quote}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text weight="semibold" className="text-sm text-textColor">
                          {pair.value.toLocaleString()}
                        </Text>
                        <View style={styles.changeRow}>
                          <Ionicons
                            name={pair.change >= 0 ? "arrow-up" : "arrow-down"}
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
                })}
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
                  setShowCurrencyModal({ type: showCurrencyModal.type, visible: false });
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text weight="semibold" className="text-sm text-textColor">
                    {option.code}
                  </Text>
                  <Text className="text-xs text-textColor/60">{option.name}</Text>
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
  summaryCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryRight: {
    alignItems: "flex-end",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
  },
  trendChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trendChipActive: {
    backgroundColor: COLORS.primary_400,
  },
  trendChipInactive: {
    backgroundColor: "#EEF1F6",
  },
  chartWrapper: {
    alignItems: "center",
    marginTop: 20,
  },
  chartLabels: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  converterField: {
    marginTop: 20,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  input: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E5EF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: COLORS.textColor,
  },
  currencySelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E5EF",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  swapRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEF1F6",
  },
  swapButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F4FD",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: COLORS.primary_400,
  },
  rateRow: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
});

export default FxRatesScreen;
