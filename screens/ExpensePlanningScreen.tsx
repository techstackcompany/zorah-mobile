import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

type TabKey = "expense" | "income";

type TabContent = {
  key: TabKey;
  label: string;
  categoryTitle: string;
  breakdownTitle: string;
  rankingTitle: string;
};

const EMPTY_STATE_MESSAGES: Record<
  TabKey,
  { title: string; subtitle: string }
> = {
  expense: {
    title: "No expense tracking information",
    subtitle: "All expenses will appear here",
  },
  income: {
    title: "No income tracking information",
    subtitle: "All income will appear here",
  },
};

const TAB_ITEMS: readonly TabContent[] = [
  {
    key: "expense",
    label: "Expense",
    categoryTitle: "Expense Category",
    breakdownTitle: "Expense Breakdown",
    rankingTitle: "Expense ranking",
  },
  {
    key: "income",
    label: "Income",
    categoryTitle: "Income Category",
    breakdownTitle: "Income Breakdown",
    rankingTitle: "Income ranking",
  },
] as const;

const PERIOD_LABEL = "2025 Sep";
const SKELETON_ROWS = Array.from({ length: 3 }, (_, index) => index);

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

type ExpenseSegment = {
  key: string;
  label: string;
  percentage: number;
  color: string;
  trackColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  labelPosition: Partial<Record<"top" | "bottom" | "left" | "right", number>>;
};

const EXPENSE_SUMMARY = {
  total: 93210,
  segments: [
    {
      key: "food-primary",
      label: "Food & Drink",
      percentage: 50,
      color: "#5D5FFE",
      trackColor: "#E6E7FF",
      icon: "fast-food-outline" as const,
      iconBackground: "#F6F5FF",
      labelPosition: { bottom: 36, left: 24 },
    },
    {
      key: "transport",
      label: "Transport",
      percentage: 18,
      color: "#FDBA4D",
      trackColor: "#FFF1DD",
      icon: "bus-outline" as const,
      iconBackground: "#FFF7E7",
      labelPosition: { top: 42, right: 36 },
    },
    {
      key: "calls",
      label: "Calls",
      percentage: 15,
      color: "#3EB489",
      trackColor: "#E5F6F0",
      icon: "call-outline" as const,
      iconBackground: "#E7F8F1",
      labelPosition: { top: 62, left: 26 },
    },
    {
      key: "data",
      label: "Data",
      percentage: 7,
      color: "#E261F3",
      trackColor: "#FBE9FF",
      icon: "wifi-outline" as const,
      iconBackground: "#F9ECFF",
      labelPosition: { bottom: 58, right: 26 },
    },
  ] as ExpenseSegment[],
};

const CHART_SIZE = 250;
const CHART_RADIUS = 95;
const CHART_STROKE_WIDTH = 40;
const CHART_OUTER_DIAMETER = CHART_RADIUS * 2 + CHART_STROKE_WIDTH;
const CHART_CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;

const ExpensePlanningScreen = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("expense");
  const [isLoading] = useState(false);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rotation = useRef(
    new Animated.Value(isCategoryCollapsed ? 1 : 0),
  ).current;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isCategoryCollapsed ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isCategoryCollapsed, rotation]);

  const chevronRotation = useMemo(
    () =>
      rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [rotation],
  );

  const tabConfig = useMemo(
    () => TAB_ITEMS.find((item) => item.key === activeTab)!,
    [activeTab],
  );

  const emptyStateContent = EMPTY_STATE_MESSAGES[activeTab];

  const isExpenseTab = activeTab === "expense";
  const addEntryRoute = isExpenseTab ? "/add-expense" : "/add-income";

  const expenseSegments = useMemo(() => {
    if (!isExpenseTab) {
      return [];
    }

    let remaining = EXPENSE_SUMMARY.total;

    return EXPENSE_SUMMARY.segments.map((segment, index, array) => {
      const amount =
        index === array.length - 1
          ? remaining
          : Math.round((EXPENSE_SUMMARY.total * segment.percentage) / 100);
      remaining -= amount;

      return {
        ...segment,
        amount,
      };
    });
  }, [isExpenseTab]);

  const totalAmountLabel = useMemo(
    () => formatCurrency(EXPENSE_SUMMARY.total),
    [],
  );
  const chartSegments = useMemo(() => {
    if (!expenseSegments.length) {
      return null;
    }

    let cumulativeOffset = 0;
    let cumulativeAngle = -Math.PI / 2;

    return expenseSegments.map((segment) => {
      const segmentLength = (segment.percentage / 100) * CHART_CIRCUMFERENCE;
      const segmentAngle = (segment.percentage / 100) * (Math.PI * 2);
      const midpointAngle = cumulativeAngle + segmentAngle / 2;
      const labelRadius = CHART_RADIUS;
      const labelX =
        CHART_SIZE / 2 + labelRadius * Math.cos(midpointAngle);
      const labelY =
        CHART_SIZE / 2 + labelRadius * Math.sin(midpointAngle);

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
      cumulativeAngle += segmentAngle;

      return element;
    });
  }, [expenseSegments]);

  return (
    <MainContainer className="bg-lightMuted" edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6">
          <View style={styles.segmentWrapper}>
            {TAB_ITEMS.map((item) => {
              const isActive = item.key === activeTab;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setActiveTab(item.key)}
                  style={[
                    styles.segmentButton,
                    isActive && styles.segmentButtonActive,
                  ]}
                  className={cn(
                    "flex-1 items-center justify-center rounded-full py-3",
                    isActive ? "bg-white" : undefined,
                  )}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={cn(
                      "text-base",
                      isActive ? "text-textColor" : "text-textColor/60",
                    )}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.card}>
            <Pressable
              className="flex-row items-center justify-between"
              onPress={() => setIsCategoryCollapsed((prev) => !prev)}
            >
              <Text weight="semibold" className="text-base text-textColor">
                {tabConfig.categoryTitle}
              </Text>
              <Animated.View
                style={{ transform: [{ rotate: chevronRotation }] }}
              >
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={COLORS.textColor}
                />
              </Animated.View>
            </Pressable>
            {!isCategoryCollapsed && (
              <>
                <View style={styles.divider} />

                <View className="mt-5 flex-row items-center justify-between">
                  <Text weight="medium" className="text-sm text-textColor/70">
                    {tabConfig.breakdownTitle}
                  </Text>
                  <Pressable style={styles.periodPill}>
                    <Text weight="semibold" className="text-sm text-textColor">
                      {PERIOD_LABEL}
                    </Text>

                    <Image
                      source={require("@/assets/icons/calendar.svg")}
                      style={{ width: 24, height: 24 }}
                    />
                  </Pressable>
                </View>

                <View style={styles.chartWrapper}>
                  {isLoading ? (
                    <View style={styles.chartSkeleton}>
                      <View style={styles.chartSkeletonRing} />
                    </View>
                  ) : isExpenseTab ? (
                    <View style={styles.chartContainer}>
                      <View style={styles.chartSvgWrapper}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE}>
                          <G
                         
                          >
                            <Circle
                              cx={CHART_SIZE / 2}
                              cy={CHART_SIZE / 2}
                              r={CHART_RADIUS}
                              stroke='#eee'
                              strokeWidth={CHART_STROKE_WIDTH}
                              fill="transparent"
                            />
                            {chartSegments}
                          </G>
                        </Svg>
                      </View>

                      <View style={styles.chartCenter}>
                        <Text
                          weight="medium"
                          className="text-xs text-textColor/60"
                        >
                          Total spend
                        </Text>
                        <Text
                          weight="bold"
                          className="mt-1 text-xl text-textColor"
                        >
                          {totalAmountLabel}
                        </Text>
                      </View>

                    </View>
                  ) : (
                    <View style={styles.chartEmptyState}>
                      <Ionicons
                        name="pie-chart-outline"
                        size={36}
                        color={COLORS.textColor}
                      />
                      <Text className="mt-3 text-sm text-textColor/60">
                        Insights for this period will appear here.
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>

          <View className="mt-8">
            <Text weight="semibold" className="text-base text-textColor">
              {tabConfig.rankingTitle}
            </Text>

            <View style={styles.rankingCard}>
              {isLoading ? (
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
              ) : isExpenseTab ? (
                <View className="gap-6">
                  {expenseSegments.map((segment) => (
                    <View
                      key={segment.key}
                      className="flex-row items-center gap-4"
                    >
                      <View
                        style={[
                          styles.rankingIcon,
                          { backgroundColor: segment.iconBackground },
                        ]}
                      >
                        <Ionicons
                          name={segment.icon}
                          size={20}
                          color={segment.color}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text
                            weight="semibold"
                            className="text-sm text-textColor"
                          >
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
                          <Text
                            weight="semibold"
                            className="text-sm text-textColor"
                          >
                            {formatCurrency(segment.amount)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.rankingEmptyState}>
                  <Text className="text-sm text-textColor/60">
                    Switch to the expense tab to view category rankings.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
       <View style={{paddingBottom:bottom }} className="absolute bottom-0  left-0 right-0 bg-white">
        <View style={styles.emptyState}>
          <Text weight="semibold" className="text-lg text-textColor/80">
            {emptyStateContent.title}
          </Text>
          <Text className="mt-1 text-sm text-textColor/50">
            {emptyStateContent.subtitle}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.floatingButton, {    bottom: 16 + bottom,
}]}
          onPress={() => router.push(addEntryRoute)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.floatingButton, { bottom: 16 + bottom }]}
        onPress={() => router.push(addEntryRoute)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </MainContainer>
  );
};

export default ExpensePlanningScreen;



const styles = StyleSheet.create({
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1528",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  segmentWrapper: {
    marginTop: 24,
    flexDirection: "row",
    backgroundColor: COLORS.lightBg,
    borderRadius: 32,
    padding: 4,
  },
  segmentButton: {
    borderRadius: 28,
  },
  segmentButtonActive: {
    shadowColor: "#182542",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  card: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  divider: {
    marginTop: 18,
    height: 1,
    backgroundColor: "#EFF1F6",
  },
  periodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.lightBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chartWrapper: {
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
  },
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
  chartLabel: {
    position: "absolute",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#C5C9D7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  chartEmptyState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.lightBg,
    borderRadius: 18,
  },
  chartSkeleton: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  chartSkeletonRing: {
    width: CHART_OUTER_DIAMETER,
    height: CHART_OUTER_DIAMETER,
    borderRadius: CHART_OUTER_DIAMETER / 2,
    borderWidth: CHART_STROKE_WIDTH,
    borderColor: COLORS.lightBg,
    backgroundColor: "#FFFFFF",
  },
  rankingCard: {
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.lightBg,
  },
  skeletonLinePrimary: {
    height: 8,
    borderRadius: 12,
    backgroundColor: COLORS.lightBg,
    width: "90%",
  },
  skeletonLineSecondary: {
    height: 7,
    borderRadius: 12,
    backgroundColor: COLORS.lightBg,
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
    backgroundColor: COLORS.lightBg,
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
   emptyState: {
    paddingVertical: 20,
    marginEnd: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 24,
    shadowColor: "#0F2A72",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },
});
