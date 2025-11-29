import React from "react";
import { View, StyleSheet } from "react-native";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { getChangeColor } from "@/constants/fx";
import { Ionicons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 3,
  },
  summaryRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  changeRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
});

export type FxSummaryCardProps = {
  pairLabel: string;
  rateValue: number;
  changePercent: number;
};

const FxSummaryCard = ({ pairLabel, rateValue, changePercent }: FxSummaryCardProps) => {
  const changeColor = getChangeColor(changePercent);
  const changeBackground = changePercent >= 0 ? "#E9F7EC" : "#FFE6EA";

  return (
    <View style={styles.container}>
      <View>
        <Text weight="medium" className="text-xl text-textColor/50">
          {pairLabel}
        </Text>
        <Text weight="bold" className="mt-3 text-3xl text-textColor">
          {rateValue > 0 ? (
            <>
              ₦
              {rateValue.toLocaleString(undefined, {
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
        <View style={[styles.changeBadge, { backgroundColor: changeBackground }]}>
          <Text weight="semibold" className="ml-1 text-xs" style={{ color: changeColor }}>
            {changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.changeRow}>
          <Ionicons
            name={changePercent >= 0 ? "trending-up" : "trending-down"}
            size={14}
            color={changePercent >= 0 ? COLORS.secondary_500 : "#D83A56"}
          />
          <Text className="ms-1 text-xs text-textColor/60">24hr change</Text>
        </View>
      </View>
    </View>
  );
};

export default FxSummaryCard;
