import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { FX_TRENDS } from "@/constants/fx";

const CHART_HEIGHT = 160;

export type FxChartCardProps = {
  activeTrend: keyof typeof FX_TRENDS;
  onSelectTrend: (trend: keyof typeof FX_TRENDS) => void;
  activeSeries: { label: string; value: number }[];
  lineChartData: { value: number; label: string; hideDataPoint?: boolean }[];
  isFetchingHistory: boolean;
  yAxisRange?: number;
  yAxisOffset?: number;
  formatYLabel: (label: string) => string;
};

const FxChartCard = ({
  activeTrend,
  onSelectTrend,
  activeSeries,
  lineChartData,
  isFetchingHistory,
  yAxisRange,
  yAxisOffset,
  formatYLabel,
}: FxChartCardProps) => {
  const [chartWidth, setChartWidth] = useState(0);
  const chartSpacing =
    chartWidth > 0 && lineChartData.length > 1
      ? (chartWidth - 70) / (lineChartData.length - 1)
      : 30;

  return (
    <View style={[styles.card, { backgroundColor: COLORS.primary_100 }]}>
      <View style={styles.tabRow}>
        <Text className="me-4">Rates Trends</Text>
        {["USDNGN", "GBPNGN", "EURNGN"].map((trend) => {
          const isActive = trend === activeTrend;
          return (
            <Pressable
              key={trend}
              onPress={() => onSelectTrend(trend as keyof typeof FX_TRENDS)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[styles.trendChip, isActive && styles.trendChipActive]}
            >
              <Text
                weight={isActive ? "semibold" : "medium"}
                className={`text-xs ${isActive ? "text-white" : "text-textColor/60"}`}
              >
                {trend.length === 6 ? `${trend.slice(0, 3)}/${trend.slice(3)}` : trend}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View
        style={styles.chartWrapper}
        onLayout={({ nativeEvent: { layout } }) => setChartWidth(layout.width)}
      >
        {isFetchingHistory ? (
          <ActivityIndicator size="small" color={COLORS.primary_400} style={{ marginBottom: 8 }} />
        ) : null}
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
            yAxisOffset={yAxisOffset}
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
  );
};

const styles = StyleSheet.create({
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
  chartPlaceholder: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
});

export default FxChartCard;
