import Text from "@/components/ui/Text";
import { ChartSegment } from "@/features/expense-income/types";
import { renderCategoryIcon } from "@/features/expense-income/utils";
import React from "react";
import { StyleSheet, View } from "react-native";

type CategoryRankingProps = {
  segments: ChartSegment[];
  isLoading?: boolean;
  emptyMessage: string;
  formatCurrency: (value: number) => string;
};

const SKELETON_ROWS = Array.from({ length: 3 }, (_, index) => index);

const CategoryRanking = ({
  segments,
  isLoading = false,
  emptyMessage,
  formatCurrency,
}: CategoryRankingProps) => {
  if (isLoading) {
    return (
      <View className="gap-5">
        {SKELETON_ROWS.map((row) => (
          <View key={row} className="flex-row items-center gap-4">
            <View style={styles.skeletonIcon} />
            <View className="flex-1 gap-2">
              <View style={styles.skeletonLinePrimary} />
              <View style={styles.skeletonLineSecondary} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (!segments.length) {
    return (
      <View style={styles.rankingEmptyState}>
        <Text className="text-sm text-textColor/60">{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View className="gap-6">
      {segments.map((segment) => (
        <View key={segment.key} className="flex-row items-center gap-4">
          <View
            style={[
              styles.rankingIcon,
              { backgroundColor: segment.iconBackground },
            ]}
          >
            {renderCategoryIcon(segment.iconSource, 20, segment.color)}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text weight="semibold" className="text-sm text-textColor">
                {segment.label}
              </Text>
              <Text className="text-sm text-textColor/70">
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
              <Text weight="semibold" className="text-sm text-textColor">
                {formatCurrency(segment.amount)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
  },
  skeletonLinePrimary: {
    height: 8,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
    width: "90%",
  },
  skeletonLineSecondary: {
    height: 7,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
    width: "60%",
  },
  rankingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 12,
  },
  rankingEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
});

export default CategoryRanking;
