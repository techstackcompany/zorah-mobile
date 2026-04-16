import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { ChartSegment } from "@/features/expense-income/types";
import { renderCategoryIcon } from "@/features/expense-income/utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

type ExpenseSummaryCardProps = {
  segments: ChartSegment[];
  total: number;
  isLoading?: boolean;
  formatCurrency: (value: number) => string;
  onPress: () => void;
};

const CHART_SIZE = 140;
const CHART_RADIUS = 50;
const CHART_STROKE_WIDTH = 24;
const CHART_CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;
const MAX_RANKING_ITEMS = 3;

const MiniPieChart = ({
  segments,
  total,
  formatCurrency,
}: {
  segments: ChartSegment[];
  total: number;
  formatCurrency: (value: number) => string;
}) => {
  let cumulativeOffset = 0;

  return (
    <View style={styles.chartContainer}>
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        <G>
          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={CHART_RADIUS}
            stroke="#eee"
            strokeWidth={CHART_STROKE_WIDTH}
            fill="transparent"
          />
          {segments.map((segment) => {
            const segmentLength =
              (segment.percentage / 100) * CHART_CIRCUMFERENCE;
            const element = (
              <Circle
                key={segment.key}
                cx={CHART_SIZE / 2}
                cy={CHART_SIZE / 2}
                r={CHART_RADIUS}
                stroke={segment.color}
                strokeWidth={CHART_STROKE_WIDTH}
                strokeDasharray={`${segmentLength} ${CHART_CIRCUMFERENCE}`}
                strokeDashoffset={cumulativeOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            );
            cumulativeOffset -= segmentLength;
            return element;
          })}
        </G>
      </Svg>
      <View style={styles.chartCenter}>
        <Text weight="medium" className="text-[10px] text-textColor/50">
          Total
        </Text>
        <Text weight="bold" className="text-sm text-textColor">
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );
};

const ExpenseSummaryCard = ({
  segments,
  total,
  isLoading = false,
  formatCurrency,
  onPress,
}: ExpenseSummaryCardProps) => {
  const topSegments = segments.slice(0, MAX_RANKING_ITEMS);

  return (
    <Pressable
      onPress={onPress}
      className="mt-8 rounded-3xl bg-white px-5 py-5"
      accessibilityRole="button"
    >
      <View className="flex-row items-center justify-between">
        <Text weight="semibold" className="text-base">
          Expense Summary
        </Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textColor} />
      </View>

      {isLoading ? (
        <View className="items-center justify-center py-10">
          <ActivityIndicator size="small" color={COLORS.primary_400} />
        </View>
      ) : segments.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Ionicons
            name="pie-chart-outline"
            size={32}
            color={`${COLORS.textColor}60`}
          />
          <Text className="mt-2 text-sm text-textColor/50">
            No expense data yet
          </Text>
        </View>
      ) : (
        <View className="mt-4 flex-row gap-4">
          <MiniPieChart
            segments={segments}
            total={total}
            formatCurrency={formatCurrency}
          />

          <View className="flex-1 justify-center gap-4">
            {topSegments.map((segment) => (
              <View key={segment.key} className="flex-row items-center gap-3">
                <View
                  style={[
                    styles.rankingIcon,
                    { backgroundColor: segment.iconBackground },
                  ]}
                >
                  {renderCategoryIcon(segment.iconSource, 14, segment.color)}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      weight="semibold"
                      className="text-xs text-textColor"
                      numberOfLines={1}
                    >
                      {segment.label}
                    </Text>
                    <Text className="text-xs text-textColor/60">
                      {segment.percentage}%
                    </Text>
                  </View>
                  <View style={styles.progressRow}>
                    <View
                      style={[
                        styles.progressTrack,
                        { backgroundColor: segment.trackColor },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: segment.color,
                            width: `${segment.percentage}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
            {segments.length > MAX_RANKING_ITEMS && (
              <Text className="text-xs text-primary_400" weight="medium">
                +{segments.length - MAX_RANKING_ITEMS} more
              </Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  rankingIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default ExpenseSummaryCard;
