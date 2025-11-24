import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { MonthlyExpenseTotal } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";

type MonthlyExpenseChartProps = {
  monthlyExpenses: MonthlyExpenseTotal[];
  isLoading?: boolean;
  formatCurrency: (value: number) => string;
  formatDate?: (month: number, year: number) => string;
};

const MAX_BAR_HEIGHT = 120;
const BAR_WIDTH = 40; // Fixed bar width - consistent across all months
const BAR_GAP = 16; // Spacing between each bar container

const formatMonthlyDate = (month: number, year: number): string => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[month - 1]} ${year}`;
};

const MonthlyExpenseChart = ({
  monthlyExpenses,
  isLoading = false,
  formatCurrency,
  formatDate = formatMonthlyDate,
}: MonthlyExpenseChartProps) => {
  const transformedData = useMemo(() => {
    if (!monthlyExpenses || monthlyExpenses.length === 0) return [];

    // Sort by date (newest first)
    const sorted = [...monthlyExpenses].sort((a, b) => {
      const dateA = new Date(a._id.year, a._id.month - 1, 1);
      const dateB = new Date(b._id.year, b._id.month - 1, 1);
      return dateB.getTime() - dateA.getTime();
    });

    // Get max total for scaling
    const maxTotal = Math.max(...sorted.map((item) => item.total), 1);

    return sorted.map((item) => ({
      ...item,
      formattedDate: formatDate(item._id.month, item._id.year),
      barHeight: (item.total / maxTotal) * MAX_BAR_HEIGHT,
    }));
  }, [monthlyExpenses, formatDate]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.chartArea}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.skeletonBarContainer}>
              <View style={styles.skeletonBar} />
              <View style={styles.skeletonLabel} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!transformedData.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="calendar-outline"
          size={32}
          color={COLORS.textColor}
          style={{ opacity: 0.4 }}
        />
        <Text className="mt-3 text-sm text-textColor/60">
          No monthly expense data available.
        </Text>
      </View>
    );
  }

  const renderBarItem = ({ item, index }: { item: typeof transformedData[0]; index: number }) => {
    return (
      <View style={styles.barContainer}>
        <View style={styles.barWrapper}>
          <View
            style={[
              styles.bar,
              {
                height: Math.max(item.barHeight, 8), // Minimum height for visibility
                backgroundColor: COLORS.primary_400,
              },
            ]}
          />
          <Text
            weight="semibold"
            className="mt-2 text-xs text-textColor"
            numberOfLines={1}
            style={styles.amountLabel}
          >
            {formatCurrency(item.total)}
          </Text>
        </View>
        <Text
          className="mt-2 text-xs text-textColor/60"
          numberOfLines={1}
          style={styles.dateLabel}
        >
          {item.formattedDate}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transformedData}
        renderItem={renderBarItem}
        keyExtractor={(item, index) => `${item._id.year}-${item._id.month}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ItemSeparatorComponent={() => <View style={{ width: BAR_GAP }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: "flex-end",
    minHeight: MAX_BAR_HEIGHT + 60,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: BAR_GAP,
    minHeight: MAX_BAR_HEIGHT + 60,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    // Container width will be determined by its content (amount text)
    // No fixed width - will expand to fit the amount text
  },
  barWrapper: {
    alignItems: "center",
    // Width will be determined by the amount text inside
  },
  bar: {
    width: BAR_WIDTH, // Fixed bar width - consistent across all months
    borderRadius: 8,
    backgroundColor: COLORS.primary_400,
    alignSelf: "center", // Center the bar within the container
  },
  amountLabel: {
    textAlign: "center",
    // Width will be determined by text content, preventing wrapping
    // No fixed width - container will expand to fit
  },
  dateLabel: {
    textAlign: "center",
    // Width will match the container (determined by amount)
    // No fixed width - will match container width
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.lightBg,
    borderRadius: 18,
  },
  skeletonBarContainer: {
    alignItems: "center",
    width: BAR_WIDTH,
  },
  skeletonBar: {
    width: BAR_WIDTH,
    height: MAX_BAR_HEIGHT * 0.6,
    borderRadius: 8,
    backgroundColor: COLORS.lightBg,
  },
  skeletonLabel: {
    width: BAR_WIDTH - 8,
    height: 12,
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightBg,
  },
});

export default MonthlyExpenseChart;

