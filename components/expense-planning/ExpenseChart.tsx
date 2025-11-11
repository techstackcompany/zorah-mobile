import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

export type ChartSegment = {
  key: string;
  label: string;
  percentage: number;
  color: string;
  trackColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  labelPosition: Partial<Record<"top" | "bottom" | "left" | "right", number>>;
  amount: number;
};

type ExpenseChartProps = {
  segments: ChartSegment[];
  total: number;
  totalLabel: string;
  isLoading?: boolean;
  formatCurrency: (value: number) => string;
};

const CHART_SIZE = 250;
const CHART_RADIUS = 95;
const CHART_STROKE_WIDTH = 40;
const CHART_CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;

const ExpenseChart = ({
  segments,
  total,
  totalLabel,
  isLoading = false,
  formatCurrency,
}: ExpenseChartProps) => {
  const chartSegments = React.useMemo(() => {
    if (!segments.length) {
      return null;
    }

    let cumulativeOffset = 0;

    return segments.map((segment) => {
      const segmentLength = (segment.percentage / 100) * CHART_CIRCUMFERENCE;
      const segmentAngle = (segment.percentage / 100) * (Math.PI * 2);
      const startAngle =
        (-cumulativeOffset / CHART_CIRCUMFERENCE) * (Math.PI * 2);
      const midpointAngle = startAngle + segmentAngle / 2;
      const labelRadius = CHART_RADIUS;
      const labelX = CHART_SIZE / 2 + labelRadius * Math.cos(midpointAngle);
      const labelY = CHART_SIZE / 2 + labelRadius * Math.sin(midpointAngle);

      const element = (
        <React.Fragment key={segment.key}>
          <Circle
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
          <SvgText
            x={labelX}
            y={labelY}
            fill={COLORS.textColor}
            fontSize={12}
            fontWeight="600"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {segment.percentage}%
          </SvgText>
        </React.Fragment>
      );

      cumulativeOffset -= segmentLength;

      return element;
    });
  }, [segments]);

  if (isLoading) {
    return (
      <View style={styles.chartSkeleton}>
        <View style={styles.chartSkeletonRing}>
          <Text weight="bold" className="text-lg">
            {formatCurrency(0)}
          </Text>
        </View>
      </View>
    );
  }

  if (!segments.length) {
    return (
      <View style={styles.chartEmptyState}>
        <Ionicons name="pie-chart-outline" size={36} color={COLORS.textColor} />
        <Text className="mt-3 text-sm text-textColor/60">
          Insights for this period will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartSvgWrapper}>
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
            {chartSegments}
          </G>
        </Svg>
      </View>

      <View style={styles.chartCenter}>
        <Text weight="medium" className="text-xs text-textColor/60">
          {totalLabel}
        </Text>
        <Text weight="bold" className="mt-1 text-xl text-textColor">
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  chartSvgWrapper: {
    width: CHART_SIZE,
    height: CHART_SIZE,
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  chartSkeleton: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  chartSkeletonRing: {
    width: CHART_RADIUS * 2 + CHART_STROKE_WIDTH,
    height: CHART_RADIUS * 2 + CHART_STROKE_WIDTH,
    borderRadius: (CHART_RADIUS * 2 + CHART_STROKE_WIDTH) / 2,
    borderWidth: CHART_STROKE_WIDTH,
    borderColor: COLORS.lightBg,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  chartEmptyState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.lightBg,
    borderRadius: 18,
  },
});

export default ExpenseChart;
