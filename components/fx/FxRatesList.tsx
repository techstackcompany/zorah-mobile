import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { CURRENCY_FLAGS, FxPair, getChangeColor } from "@/constants/fx";
import { Image, ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export type FxRatesListProps = {
  converterTab: "fx" | "crypto";
  onChangeTab: (tab: "fx" | "crypto") => void;
  pairs: FxPair[];
  isFetching: boolean;
};

const FxRatesList = ({ converterTab, onChangeTab, pairs, isFetching }: FxRatesListProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.segmentWrapper}>
        <Pressable
          style={[styles.segmentButton, converterTab === "fx" ? styles.segmentButtonActive : null]}
          accessibilityRole="button"
          accessibilityState={{ selected: converterTab === "fx" }}
          onPress={() => onChangeTab("fx")}
        >
          <Text
            weight={converterTab === "fx" ? "semibold" : "medium"}
            className={`text-sm ${converterTab === "fx" ? "text-textColor" : "text-textColor/60"}`}
          >
            FX Rates
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, converterTab === "crypto" ? styles.segmentButtonActive : null]}
          accessibilityRole="button"
          accessibilityState={{ selected: converterTab === "crypto" }}
          onPress={() => onChangeTab("crypto")}
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
            {isFetching ? (
              <ActivityIndicator size="small" color={COLORS.primary_400} />
            ) : pairs.length > 0 ? (
              pairs.map((pair, index) => (
                <FxRateRow
                  key={pair.id}
                  pair={pair}
                  baseFlag={CURRENCY_FLAGS[pair.base]}
                  quoteFlag={CURRENCY_FLAGS[pair.quote]}
                  isLast={index === pairs.length - 1}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text className="text-sm text-textColor/60">No exchange rate data available</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.cryptoPlaceholder}>
          <Text className="text-sm text-textColor/60">Crypto market data will appear here soon.</Text>
        </View>
      )}
    </View>
  );
};

type FxRateRowProps = {
  pair: FxPair;
  baseFlag?: ImageSource;
  quoteFlag?: ImageSource;
  isLast: boolean;
};

const FxRateRow = ({ pair, baseFlag, quoteFlag, isLast }: FxRateRowProps) => (
  <View
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
        {baseFlag ? <Image source={baseFlag} style={[styles.flagImage, styles.flagPrimary]} contentFit="cover" /> : null}
        {quoteFlag ? <Image source={quoteFlag} style={[styles.flagImage, styles.flagSecondary]} contentFit="cover" /> : null}
      </View>
      <View>
        <Text weight="semibold" className="text-sm text-textColor">
          {pair.label}
        </Text>
        <Text className="text-xs text-textColor/50">
          {pair.base}/{pair.quote}
        </Text>
      </View>
    </View>
    <View style={{ alignItems: "flex-end" }}>
      <Text weight="semibold" className="text-sm text-textColor">
        <Text className="text-xs">{pair.quote}</Text>{pair.value.toLocaleString()}
      </Text>
      <View style={styles.changeRow}>
        <Ionicons name={pair.change >= 0 ? "arrow-up" : "arrow-down"} size={12} color={getChangeColor(pair.change)} />
        <Text className="ml-1 text-xs" style={{ color: getChangeColor(pair.change) }}>
          {pair.change >= 0 ? "+" : ""}
          {pair.change.toFixed(2)}%
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: "white",
    padding: 20,
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
  emptyState: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FxRatesList;
