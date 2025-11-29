import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { ImageSource } from "expo-image";
import CurrencySelectButton from "./CurrencySelectButton";

export type FxConverterCardProps = {
  formattedAmount: string;
  toAmount: string;
  onAmountChange: (value: string) => void;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  fromFlag?: ImageSource;
  toFlag?: ImageSource;
  onOpenFromCurrency: () => void;
  onOpenToCurrency: () => void;
  onSwap: () => void;
  lastUpdatedLabel: string;
};

const FxConverterCard = ({
  formattedAmount,
  toAmount,
  onAmountChange,
  fromCurrencyCode,
  toCurrencyCode,
  fromFlag,
  toFlag,
  onOpenFromCurrency,
  onOpenToCurrency,
  onSwap,
  lastUpdatedLabel,
}: FxConverterCardProps) => {
  return (
    <View style={styles.card}>
      <Text weight="semibold" className="mb-2 text-base text-textColor">
        Currency Converter
      </Text>

      <View style={styles.converterField}>
        <View style={{ flex: 1 }}>
          <Text className="text-sm text-textColor">From</Text>
          <TextInput
            value={formattedAmount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            className="text-textColor/70"
            style={styles.input}
            placeholderTextColor="#A0A8B2"
          />
        </View>
        <CurrencySelectButton
          code={fromCurrencyCode}
          flag={fromFlag}
          onPress={onOpenFromCurrency}
        />
      </View>

      <View style={styles.swapRow}>
        <TouchableOpacity accessibilityRole="button" style={styles.swapButton} onPress={onSwap}>
          <Ionicons name="swap-vertical" size={24} color={COLORS.primary_400} />
        </TouchableOpacity>
      </View>

      <View style={styles.converterField}>
        <View style={{ flex: 1 }}>
          <Text className="text-sm text-textColor">To</Text>
          <TextInput editable={false} value={toAmount} style={[styles.input]} className="text-textColor/70" />
        </View>
        <CurrencySelectButton
          code={toCurrencyCode}
          flag={toFlag}
          onPress={onOpenToCurrency}
        />
      </View>
      <View className="mt-4 flex-row items-center gap-3">
        <Ionicons name="time-outline" size={16} color={COLORS.textColor} />
        <Text className="text-sm text-textColor/50">Rates Updated: {lastUpdatedLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: "white",
    padding: 20,
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
});

export default FxConverterCard;
