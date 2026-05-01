import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  useGetBudgetsQuery,
  useGetCategoriesQuery,
  useGetExpenseSummaryQuery,
  useGetSpendingOverviewQuery,
} from "@/src/api/hooks";
import {
  BudgetListItem,
  CategoryItem,
  SpendingOverviewTimeframe,
} from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

const TIMEFRAME_TABS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
] as const;

type TimeframeKey = (typeof TIMEFRAME_TABS)[number]["key"];

type ChartBar = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type MostSpendingItem = {
  id: string;
  label: string;
  change: string;
  amount: number;
  icon: string | null;
  accent: string;
  tint: string;
};

type BreakdownItem = {
  id: string;
  label: string;
  icon: string | null;
  usage: string;
  amount: number;
  variance: number;
  status: {
    label: string;
    textColor: string;
    background: string;
  };
};

type AlertItem = {
  id: string;
  label: string;
  description: string;
  icon: string | null;
  accent: string;
  background: string;
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
});

const formatCurrency = (value: number) =>
  currencyFormatter.format(Math.abs(value));

const ACCENT_COLORS = [
  { accent: "#F8924F", tint: "#FFF3EA" },
  { accent: "#2D9CDB", tint: "#E8F4FF" },
  { accent: COLORS.purple, tint: "#F1EEFF" },
  { accent: "#27AE60", tint: "#E8F5E9" },
  { accent: "#EB5757", tint: "#FFE5E5" },
  { accent: "#9B51E0", tint: "#F3E8FF" },
];

const getAccentColor = (index: number) => {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
};

const getBarColor = (value: number, average: number) => {
  if (value > average * 1.2) return "#E75A7C";
  if (value > average) return "#F8924F";
  return "#32A34D";
};

const getBudgetStatus = (spent: number, limit: number) => {
  const percentage = (spent / limit) * 100;
  if (percentage >= 100) {
    return {
      label: "Budget Exceed",
      textColor: "#D83A56",
      background: "#FFE6EA",
    };
  }
  if (percentage >= 85) {
    return {
      label: "Approaching Limit",
      textColor: "#C47F0E",
      background: "#FFF5DD",
    };
  }
  return {
    label: "On Track",
    textColor: COLORS.secondary_500,
    background: COLORS.secondary_150,
  };
};

const findCategoryIcon = (
  categoryName: string,
  categories: CategoryItem[],
): string | null => {
  const category = categories.find(
    (cat) => cat.label.toLowerCase() === categoryName.toLowerCase(),
  );
  return category?.icon && typeof category.icon === "string"
    ? category.icon
    : null;
};

const TrackSpendingScreen = () => {
  const [activeTab, setActiveTab] = useState<TimeframeKey>("daily");

  const { data: categories = [] } = useGetCategoriesQuery("expense");

  const {
    data: spendingOverviewData,
    isLoading: isLoadingOverview,
    isFetching: isFetchingOverview,
    isError: isOverviewError,
  } = useGetSpendingOverviewQuery(activeTab as SpendingOverviewTimeframe);

  const {
    data: expenseSummary,
    isLoading: isLoadingSummary,
    isFetching: isFetchingSummary,
    isError: isSummaryError,
  } = useGetExpenseSummaryQuery(activeTab);

  const {
    data: budgetsData,
    isLoading: isLoadingBudgets,
    isError: isBudgetsError,
  } = useGetBudgetsQuery();

  const isInitialLoading =
    isLoadingOverview || isLoadingSummary || isLoadingBudgets;
  const isFetching = isFetchingOverview || isFetchingSummary;
  const isError = isOverviewError || isSummaryError || isBudgetsError;

  const budgets = useMemo(() => {
    if (!budgetsData) return [];
    if (Array.isArray(budgetsData)) return budgetsData;
    if ("data" in budgetsData && Array.isArray(budgetsData.data))
      return budgetsData.data;
    return [];
  }, [budgetsData]);

  const chartData = useMemo((): ChartBar[] => {
    if (!spendingOverviewData?.chartData?.length) {
      return [];
    }

    const aggregated = new Map<string, { label: string; value: number }>();

    spendingOverviewData.chartData.forEach((item) => {
      const { _id } = item;
      let key = "";
      let label = "";
      const yearSuffix = _id.year ? `'${String(_id.year).slice(-2)}` : "";

      if (_id.day !== undefined) {
        key = `${_id.year}-${_id.month}-${_id.day}`;
        label = `${_id.day}/${_id.month}`;
      } else if (_id.week !== undefined) {
        const weekNum = _id.week === 0 ? 1 : _id.week;
        key = `${_id.year}-W${weekNum}`;
        label = `W${weekNum}${yearSuffix}`;
      } else if (_id.month !== undefined) {
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
        key = `${_id.year}-${_id.month}`;
        label = `${monthNames[(_id.month - 1) % 12]}${yearSuffix}`;
      }

      if (key) {
        const existing = aggregated.get(key);
        if (existing) {
          existing.value += item.totalAmount;
        } else {
          aggregated.set(key, { label, value: item.totalAmount });
        }
      }
    });

    const aggregatedArray = Array.from(aggregated.values());
    const totalSpent = aggregatedArray.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    const average = totalSpent / aggregatedArray.length;

    return aggregatedArray.map((item, index) => ({
      id: `chart-${index}`,
      label: item.label,
      value: item.value,
      color: getBarColor(item.value, average),
    }));
  }, [spendingOverviewData]);

  const trendInfo = useMemo(() => {
    if (!spendingOverviewData?.comparison) {
      return { change: "+0%", remainder: "no data" };
    }

    const { comparison } = spendingOverviewData;
    const sign = comparison.isIncrease ? "+" : "-";
    const timeframeLabel =
      activeTab === "daily"
        ? "vs yesterday"
        : activeTab === "weekly"
          ? "vs last week"
          : "vs last month";

    return {
      change: `${sign}${comparison.percentage}%`,
      remainder: timeframeLabel,
    };
  }, [spendingOverviewData, activeTab]);

  const mostSpending = useMemo((): MostSpendingItem[] => {
    if (!expenseSummary?.byCategory?.length) {
      return [];
    }

    const sortedCategories = [...expenseSummary.byCategory]
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    return sortedCategories.map((cat, index) => {
      const colors = getAccentColor(index);
      const percentageChange = "+0%";
      const icon = findCategoryIcon(cat.category, categories);

      return {
        id: cat.category,
        label: cat.category,
        change: percentageChange,
        amount: cat.total,
        icon,
        accent: colors.accent,
        tint: colors.tint,
      };
    });
  }, [expenseSummary, categories]);

  const breakdown = useMemo((): BreakdownItem[] => {
    if (!budgets.length) {
      return [];
    }
    return budgets
      .filter((budget: BudgetListItem) => budget.Limit || budget.amount)
      .map((budget: BudgetListItem) => {
        const limit = budget.Limit || budget.amount || 0;
        const spent = budget.spent || budget.totalSpent || 0;
        const remaining = budget.remaining ?? limit - spent;
        const usagePercentage = limit > 0 ? (spent / limit) * 100 : 0;
        const icon = findCategoryIcon(budget.category, categories);

        return {
          id: budget._id,
          label: budget.category,
          icon,
          usage: `${Math.min(usagePercentage, 100).toFixed(0)}% of budget used`,
          amount: spent,
          variance: remaining,
          status: getBudgetStatus(spent, limit),
        };
      })
      .slice(0, 5);
  }, [budgets, categories]);

  const alerts = useMemo((): AlertItem[] => {
    if (!budgets.length) {
      return [];
    }

    return budgets
      .filter((budget: BudgetListItem) => {
        const limit = budget.Limit || budget.amount || 0;
        const spent = budget.spent || budget.totalSpent || 0;
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        return percentage >= 85;
      })
      .map((budget: BudgetListItem) => {
        const limit = budget.Limit || budget.amount || 0;
        const spent = budget.spent || budget.totalSpent || 0;
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        const icon = findCategoryIcon(budget.category, categories);

        const description =
          percentage >= 100
            ? `You've exceeded your ${budget.category} budget by ${formatCurrency(spent - limit)}. Consider adjusting your spending.`
            : `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Only ${formatCurrency(limit - spent)} remaining.`;

        return {
          id: budget._id,
          label: budget.category,
          description,
          icon,
          accent: "#E04646",
          background: "#FFE5E5",
        };
      })
      .slice(0, 3);
  }, [budgets, categories]);

  const aiTip = useMemo(() => {
    if (alerts.length > 0) {
      const topAlert = alerts[0];
      return {
        title: "Bobbie AI Assistance",
        description: `Watch out! Your ${topAlert.label} spending is high. Tap for personalized tips to save more.`,
      };
    }

    if (mostSpending.length > 0) {
      return {
        title: "Bobbie AI Assistance",
        description: `Your highest spending is on ${mostSpending[0].label}. Want tips on how to optimize this category?`,
      };
    }

    return {
      title: "Bobbie AI Assistance",
      description:
        "You're doing great! Keep tracking your expenses to maintain healthy financial habits.",
    };
  }, [alerts, mostSpending]);

  const maxBarValue = useMemo(() => {
    const values = chartData.map((bar) => bar.value);
    return values.length ? Math.max(...values) : 1;
  }, [chartData]);

  if (isInitialLoading) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-textColor/60">
            Loading spending data...
          </Text>
        </View>
      </MainContainer>
    );
  }

  if (isError) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.textColor}
          />
          <Text weight="semibold" className="mt-4 text-center text-textColor">
            Unable to load spending data
          </Text>
          <Text className="mt-2 text-center text-textColor/60">
            Please check your connection and try again
          </Text>
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer edges={[]} className="bg-lightMuted">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.segmentWrapper}>
          {TIMEFRAME_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.segmentButton,
                  isActive ? styles.segmentButtonActive : null,
                ]}
              >
                <Text
                  weight={isActive ? "semibold" : "medium"}
                  className={`text-sm ${isActive ? "text-textColor" : "text-textColor/60"}`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text weight="semibold" className="text-lg text-textColor">
                Spending Overview
              </Text>
              {isFetching && (
                <ActivityIndicator size="small" color={COLORS.primary_400} />
              )}
            </View>
            <Text weight="semibold" className="text-xs text-textColor">
              <Text weight="semibold" className="text-xs text-secondary_500">
                {trendInfo.change}
              </Text>
              {trendInfo.remainder ? ` ${trendInfo.remainder}` : ""}
            </Text>
          </View>

          {chartData.length > 0 ? (
            <View className="mt-6 px-1">
              <BarChart
                data={chartData.map((bar) => ({
                  value: bar.value,
                  label: bar.label,
                  frontColor: bar.color,
                }))}
                maxValue={maxBarValue}
                height={180}
                barWidth={20}
                spacing={30}
                barBorderRadius={12}
                yAxisThickness={0}
                xAxisThickness={0}
                disableScroll
                isAnimated
                xAxisLabelTextStyle={{
                  fontFamily: "NunitoMedium",
                  fontSize: 12,
                  color: `${COLORS.textColor}60`,
                }}
                yAxisTextStyle={{
                  fontFamily: "NunitoMedium",
                  fontSize: 10,
                  color: `${COLORS.textColor}60`,
                }}
              />
            </View>
          ) : (
            <View className="mt-6 items-center py-8">
              <Ionicons
                name="bar-chart-outline"
                size={40}
                color={`${COLORS.textColor}40`}
              />
              <Text className="mt-2 text-textColor/50">
                No spending data for this period
              </Text>
            </View>
          )}

          {mostSpending.length > 0 && (
            <View className="mt-7">
              <Text weight="semibold" className="text-base text-textColor">
                Most Spending
              </Text>

              <View className="mt-3 flex-row flex-wrap justify-between">
                {mostSpending.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.mostSpendingCard,
                      { backgroundColor: item.tint },
                    ]}
                  >
                    <View className="mb-4 flex-row justify-between">
                      <View
                        style={[
                          styles.iconBadge,
                          {
                            borderColor: item.accent,
                            backgroundColor: "white",
                          },
                        ]}
                      >
                        {item.icon ? (
                          <Image
                            source={{ uri: item.icon }}
                            style={{ width: 20, height: 20 }}
                            contentFit="contain"
                          />
                        ) : (
                          <Ionicons
                            name="grid-outline"
                            size={18}
                            color={item.accent}
                          />
                        )}
                      </View>
                      <Text
                        weight="semibold"
                        className="text-base"
                        style={{ color: item.accent }}
                      >
                        {item.change}
                      </Text>
                    </View>
                    <Text className="mt-1 text-textColor/70">{item.label}</Text>
                    <Text
                      weight="semibold"
                      className="text-xs text-textColor/50"
                    >
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <ImageBackground
            style={[styles.aiCard]}
            source={require("@/assets/images/bg-patterns/fold-pattern.png")}
          >
            <View style={styles.aiIcon}>
              <Image
                source={require("@/assets/icons/ai_bot.svg")}
                style={{ width: 24, height: 24 }}
                tintColor={COLORS.textColor}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text weight="semibold" className="text-sm text-textColor">
                {aiTip.title}
              </Text>
              <Text className="mt-1 text-xs text-textColor/70">
                {aiTip.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8A94A6" />
          </ImageBackground>
        </View>

        {breakdown.length > 0 && (
          <View className="mt-6 rounded-3xl bg-white p-5">
            <Text weight="semibold" className="text-base text-textColor">
              Spending Breakdown
            </Text>

            <View className="mt-4">
              {breakdown.map((item, index) => {
                const isLast = index === breakdown.length - 1;
                return (
                  <View
                    key={item.id}
                    className={`flex-row justify-between py-4 ${isLast ? "" : "border-b border-grayLight/60"}`}
                  >
                    <View className="flex-1 flex-row items-start pr-4">
                      {item.icon && (
                        <View style={styles.breakdownIcon}>
                          <Image
                            source={{ uri: item.icon }}
                            style={{ width: 18, height: 18 }}
                            contentFit="contain"
                          />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text
                            weight="semibold"
                            className="text-base text-textColor"
                          >
                            {item.label}
                          </Text>
                          <View
                            className="ml-2 rounded-full px-3 py-1"
                            style={{
                              backgroundColor: item.status.background,
                            }}
                          >
                            <Text
                              weight="semibold"
                              className="text-[10px]"
                              style={{ color: item.status.textColor }}
                            >
                              {item.status.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="mt-2 text-xs text-textColor/60">
                          {item.usage}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text weight="bold" className="text-sm text-textColor">
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text
                        className="mt-1 text-xs"
                        style={{
                          color:
                            item.variance >= 0
                              ? COLORS.secondary_500
                              : "#D83A56",
                        }}
                      >
                        {item.variance >= 0 ? "+" : "-"}
                        {formatCurrency(item.variance)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {alerts.length > 0 && (
          <View className="mt-6 rounded-3xl bg-white p-5">
            <Text weight="semibold" className="text-base text-textColor">
              Spending Above Budget
            </Text>

            <View className="mt-4 gap-3">
              {alerts.map((alert) => (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    { backgroundColor: alert.background },
                  ]}
                >
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor: "white",
                      },
                    ]}
                  >
                    {alert.icon ? (
                      <Image
                        source={{ uri: alert.icon }}
                        style={{ width: 22, height: 22 }}
                        contentFit="contain"
                      />
                    ) : (
                      <Ionicons
                        name="trending-down-outline"
                        size={20}
                        color={alert.accent}
                      />
                    )}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      weight="bold"
                      className="text-sm"
                      style={{ color: alert.accent }}
                    >
                      {alert.label}
                    </Text>
                    <Text className="mt-1 text-xs leading-4 text-textColor/70">
                      {alert.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {breakdown.length === 0 && alerts.length === 0 && (
          <View className="mt-6 rounded-3xl bg-white p-5">
            <View className="items-center py-8">
              <Ionicons
                name="wallet-outline"
                size={40}
                color={`${COLORS.textColor}40`}
              />
              <Text
                weight="semibold"
                className="mt-4 text-center text-textColor"
              >
                No budgets set up yet
              </Text>
              <Text className="mt-2 text-center text-textColor/60">
                Create budgets to track your spending by category
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  segmentWrapper: {
    flexDirection: "row",
    backgroundColor: "#E9EDF5",
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
    backgroundColor: "#FFFFFF",
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  mostSpendingCard: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    marginRight: 12,
  },
  aiCard: {
    marginTop: 18,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.secondary_200,
    flexDirection: "row",
    alignItems: "center",
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.secondary_400}70`,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    alignItems: "flex-start",
  },
  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TrackSpendingScreen;
