import {
  CategoryRanking,
  DailyExpenseChart,
  DailyExpenseList,
  ExpenseChart,
  ExpenseList,
  MonthlyExpenseChart,
  MonthlyExpenseList,
  PeriodSelector,
  TabSwitcher,
  type ChartSegment,
  type PeriodType,
  type TabKey,
} from "@/components/expense-planning";
import {
  CATEGORY_BG_COLOR_MAP,
  CATEGORY_COLOR_MAP,
  CATEGORY_ICON_MAP,
  CATEGORY_TRACK_COLOR_MAP,
  formatCurrency,
  formatExpenseDate,
} from "@/components/expense-planning/utils";
import MainContainer from "@/components/layouts/MainContainer";
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import SlideUpModal from "@/components/ui/SlideUpModal";
import {
  useGetDailyExpensesQuery,
  useGetExpenseSummaryQuery,
  useGetExpensesQuery,
  useGetIncomesQuery,
  useGetMonthlyExpensesQuery,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type MonthOption = {
  key: string;
  label: string;
  month?: number;
  year?: number;
};

const ExpensePlanningScreen = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("expense");
  const [dailyViewMode, setDailyViewMode] = useState<"chart" | "list">("list");
  const [monthlyViewMode, setMonthlyViewMode] = useState<"chart" | "list">(
    "list",
  );
  const [periodType, setPeriodType] = useState<PeriodType>("daily");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("all");
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Fetch expense data
  const {
    data: expenseSummaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetExpenseSummaryQuery("monthly");

  const {
    data: expensesData,
    isLoading: isExpensesLoading,
    error,
    refetch: refetchExpenses,
  } = useGetExpensesQuery();
  const {
    data: dailyExpensesData,
    isLoading: isDailyExpensesLoading,
    refetch: refetchDailyExpenses,
  } = useGetDailyExpensesQuery();

  const {
    data: monthlyExpensesData,
    isLoading: isMonthlyExpensesLoading,
    refetch: refetchMonthlyExpenses,
  } = useGetMonthlyExpensesQuery();

  const {
    data: incomesData,
    isLoading: isIncomesLoading,
    refetch: refetchIncomes,
  } = useGetIncomesQuery();

  console.log("error", error);

  const isLoading =
    (activeTab === "expense" &&
      (isSummaryLoading ||
        isExpensesLoading ||
        (periodType === "daily" && isDailyExpensesLoading) ||
        (periodType === "monthly" && isMonthlyExpensesLoading))) ||
    (activeTab === "income" && isIncomesLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "expense") {
        const promises = [
          refetchSummary(),
          refetchExpenses(),
          periodType === "daily"
            ? refetchDailyExpenses()
            : refetchMonthlyExpenses(),
        ];
        await Promise.all(promises);
      } else if (activeTab === "income") {
        await refetchIncomes();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [
    activeTab,
    periodType,
    refetchSummary,
    refetchExpenses,
    refetchDailyExpenses,
    refetchMonthlyExpenses,
    refetchIncomes,
  ]);

  const tabConfig = useMemo(
    () => TAB_ITEMS.find((item) => item.key === activeTab)!,
    [activeTab],
  );

  const emptyStateContent = EMPTY_STATE_MESSAGES[activeTab];

  // Transform API summary data to UI format
  const expensesArray = useMemo(() => {
    if (activeTab !== "expense") return [];
    return Array.isArray(expensesData)
      ? expensesData
      : (expensesData as any)?.data || [];
  }, [expensesData, activeTab]);

  const monthOptions = useMemo<MonthOption[]>(() => {
    const seen = new Set<string>();
    const options: MonthOption[] = [];

    expensesArray.forEach((exp: any) => {
      const rawDate = exp.date || exp.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (seen.has(key)) return;
      seen.add(key);
      const label = d.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      options.push({ key, label, month: d.getMonth() + 1, year: d.getFullYear() });
    });

    options.sort((a, b) => {
      if (!a.year || !a.month || !b.year || !b.month) return 0;
      return new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime();
    });

    return [{ key: "all", label: "All time" }, ...options];
  }, [expensesArray]);

  const selectedMonthLabel = useMemo(() => {
    const found = monthOptions.find((opt) => opt.key === selectedMonthKey);
    return found?.label ?? "All time";
  }, [monthOptions, selectedMonthKey]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonthKey === "all") return expensesArray;
    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (!Number.isFinite(month) || !Number.isFinite(year)) return expensesArray;

    return expensesArray.filter((exp: any) => {
      const rawDate = exp.date || exp.createdAt;
      if (!rawDate) return false;
      const d = new Date(rawDate);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === year &&
        d.getMonth() + 1 === month
      );
    });
  }, [expensesArray, selectedMonthKey]);

  const buildExpenseSummaryFromList = useCallback(
    (list: any[]): { total: number; segments: ChartSegment[] } => {
      if (!list || list.length === 0) return { total: 0, segments: [] };

      const categoryMap = new Map<string, number>();
      let total = 0;

      list.forEach((item) => {
        const category = item.category || "Other";
        const amount = Math.abs(item.amount || 0);
        total += amount;
        categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
      });

      const labelPositions = [
        { bottom: 36, left: 24 },
        { top: 42, right: 36 },
        { top: 62, left: 26 },
        { bottom: 58, right: 26 },
      ];

      const segments: ChartSegment[] = Array.from(categoryMap.entries()).map(
        ([categoryName, amount], index) => {
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          const labelPosition = labelPositions[index % labelPositions.length] || {};

          return {
            key: `${categoryName}-${index}`,
            label: categoryName,
            percentage: Math.round(percentage),
            color: CATEGORY_COLOR_MAP[categoryName] || "#5D5FFE",
            trackColor: CATEGORY_TRACK_COLOR_MAP[categoryName] || "#E6E7FF",
            icon: CATEGORY_ICON_MAP[categoryName] || "cash-outline",
            iconBackground: CATEGORY_BG_COLOR_MAP[categoryName] || "#F6F5FF",
            labelPosition,
            amount,
          };
        },
      );

      return { total, segments };
    },
    [],
  );

  const currentSummary = useMemo(() => {
    if (activeTab === "expense") {
      return buildExpenseSummaryFromList(filteredExpenses);
    }

    if (activeTab === "income" && incomesData) {
      // Transform income data to chart segments
      const incomesArray = Array.isArray(incomesData.data)
        ? incomesData.data
        : [];

      if (incomesArray.length > 0) {
        // Group incomes by category
        const categoryMap = new Map<string, number>();
        incomesArray.forEach((income: any) => {
          const category = income.category || "Other";
          const amount = income.amount || 0;
          categoryMap.set(
            category,
            (categoryMap.get(category) || 0) + amount,
          );
        });

        // Calculate total
        const total = Array.from(categoryMap.values()).reduce(
          (sum, amount) => sum + amount,
          0,
        );

        // Transform to segments - sort by amount descending to ensure proper rendering
        const segments: ChartSegment[] = Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1]) // Sort by amount descending
          .map(([categoryName, amount], index) => {
            const percentage = total > 0 ? (amount / total) * 100 : 0;

            // Determine label position based on index
            const labelPositions = [
              { bottom: 36, left: 24 },
              { top: 42, right: 36 },
              { top: 62, left: 26 },
              { bottom: 58, right: 26 },
            ];
            const labelPosition =
              labelPositions[index % labelPositions.length] || {};

            // Generate unique colors for categories that don't have mappings
            const getColorForCategory = (cat: string, idx: number): string => {
              if (CATEGORY_COLOR_MAP[cat]) return CATEGORY_COLOR_MAP[cat];
              // Generate a color based on index for unmapped categories
              const colors = [
                "#5D5FFE", "#FDBA4D", "#3EB489", "#1A43BE", "#E261F3",
                "#27AE60", "#F2994A", "#BB6BD9", "#9B51E0", "#7E8DA0"
              ];
              return colors[idx % colors.length];
            };

            const getTrackColorForCategory = (cat: string, color: string): string => {
              if (CATEGORY_TRACK_COLOR_MAP[cat]) return CATEGORY_TRACK_COLOR_MAP[cat];
              // Use a light version of the color for track
              const trackColors: Record<string, string> = {
                "#5D5FFE": "#E6E7FF",
                "#FDBA4D": "#FFF1DD",
                "#3EB489": "#E5F6F0",
                "#1A43BE": "#E9EEFF",
                "#E261F3": "#FBE9FF",
                "#27AE60": "#E5F6F0",
                "#F2994A": "#FFF1DD",
                "#BB6BD9": "#FBE9FF",
                "#9B51E0": "#F9ECFF",
                "#7E8DA0": "#F0F2F5",
              };
              return trackColors[color] || "#E6E7FF";
            };

            const getBgColorForCategory = (cat: string, color: string): string => {
              if (CATEGORY_BG_COLOR_MAP[cat]) return CATEGORY_BG_COLOR_MAP[cat];
              // Use a very light version of the color for background
              const bgColors: Record<string, string> = {
                "#5D5FFE": "#F6F5FF",
                "#FDBA4D": "#FFF7E7",
                "#3EB489": "#E7F8F1",
                "#1A43BE": "#E9EEFF",
                "#E261F3": "#F9ECFF",
                "#27AE60": "#E7F8F1",
                "#F2994A": "#FFF7E7",
                "#BB6BD9": "#F9ECFF",
                "#9B51E0": "#F9ECFF",
                "#7E8DA0": "#F5F6F8",
              };
              return bgColors[color] || "#F6F5FF";
            };

            const categoryColor = getColorForCategory(categoryName, index);

            return {
              key: `${categoryName}-${index}`,
              label: categoryName.charAt(0).toUpperCase() + categoryName.slice(1), // Capitalize first letter
              percentage: Math.round(percentage),
              color: categoryColor,
              trackColor: getTrackColorForCategory(categoryName, categoryColor),
              icon: CATEGORY_ICON_MAP[categoryName] || "cash-outline",
              iconBackground: getBgColorForCategory(categoryName, categoryColor),
              labelPosition,
              amount,
            };
          });

        return {
          total,
          segments,
        };
      }
    }

    // Return empty data when no API data is available
    return {
      total: 0,
      segments: [],
    };
  }, [activeTab, expenseSummaryData, incomesData]);

  const isExpenseTab = activeTab === "expense";
  const addEntryRoute = isExpenseTab ? "/add-expense" : "/add-income";

  const summarySegments = useMemo(() => {
    if (!currentSummary.segments.length) {
      return [];
    }

    let remaining = currentSummary.total;

    return currentSummary.segments.map((segment, index, array) => {
      const amount =
        index === array.length - 1
          ? remaining
          : Math.round((currentSummary.total * segment.percentage) / 100);
      remaining -= amount;

      return {
        ...segment,
        amount,
      };
    });
  }, [currentSummary]);

  // Get expenses array for ExpenseList component
  // Get incomes array for IncomeList component (reusing ExpenseList)
  // Transform income data to match ExpenseItem format
  const incomesArray = useMemo(() => {
    if (activeTab !== "income") return [];
    const rawIncomes = Array.isArray(incomesData?.data)
      ? incomesData.data
      : [];
    
    // Transform Income to ExpenseItem format (they're similar)
    return rawIncomes.map((income: any) => {
      const category = income.category || "Other";
      // Capitalize the category name
      const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      
      return {
        _id: income._id,
        id: income._id,
        amount: income.amount || 0,
        category: capitalizedCategory,
        description: income.description,
        paymentMethod: income.source, // Income uses "source" instead of "paymentMethod"
        date: income.date || income.createdAt,
        createdAt: income.createdAt,
        updatedAt: income.updatedAt,
      };
    });
  }, [incomesData, activeTab]);

  // Get daily expenses array for DailyExpenseChart component
  const dailyExpensesArray = useMemo(() => {
    if (activeTab !== "expense" || periodType !== "daily") return [];
    const byDay = new Map<string, { _id: { day: number; month: number; year: number }; total: number }>();

    filteredExpenses.forEach((expense: any) => {
      const rawDate = expense.date || expense.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const total = byDay.get(key)?.total || 0;
      byDay.set(key, {
        _id: { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() },
        total: total + Math.abs(expense.amount || 0),
      });
    });

    return Array.from(byDay.values());
  }, [activeTab, filteredExpenses, periodType]);

  // Get monthly expenses array for MonthlyExpenseList component
  const monthlyExpensesArray = useMemo(() => {
    if (activeTab !== "expense" || periodType !== "monthly") return [];
    const byMonth = new Map<string, { _id: { month: number; year: number }; total: number }>();

    filteredExpenses.forEach((expense: any) => {
      const rawDate = expense.date || expense.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const total = byMonth.get(key)?.total || 0;
      byMonth.set(key, {
        _id: { month: d.getMonth() + 1, year: d.getFullYear() },
        total: total + Math.abs(expense.amount || 0),
      });
    });

    return Array.from(byMonth.values());
  }, [activeTab, filteredExpenses, periodType]);
  return (
    <MainContainer className="bg-lightMuted pb-0" edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6">
          <TabSwitcher
            tabs={TAB_ITEMS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <CollapsibleCard
            headerBottomBorder
            title={tabConfig.categoryTitle}
            style={styles.card}
          >
            <View className="flex-row items-center justify-between p-5">
              <Text weight="medium" className="text-sm text-textColor/70">
                {tabConfig.breakdownTitle}
              </Text>
              <Pressable
                style={styles.periodPill}
                onPress={() => setShowMonthPicker(true)}
              >
                <Text weight="semibold" className="text-sm text-textColor">
                  {selectedMonthLabel}
                </Text>

                <Image
                  source={require("@/assets/icons/calendar.svg")}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
            </View>

            <View style={styles.chartWrapper}>
              <ExpenseChart
                segments={summarySegments}
                total={currentSummary.total}
                totalLabel={`Total ${tabConfig.label.toLowerCase()}`}
                isLoading={isLoading}
                formatCurrency={formatCurrency}
              />
            </View>
          </CollapsibleCard>

          <View className="mt-8">
            <Text weight="semibold" className="text-base text-textColor">
              {tabConfig.rankingTitle}
            </Text>

            <View style={styles.rankingCard}>
              <CategoryRanking
                segments={summarySegments}
                isLoading={isLoading}
                emptyMessage={`Add an entry to see your ${tabConfig.label.toLowerCase()} rankings.`}
                formatCurrency={formatCurrency}
              />
            </View>
          </View>

          {/* Daily/Monthly Spending Section */}
          {activeTab === "expense" && (
            <View className="mt-8">
                <View className="flex-row items-center justify-between">
                  <Text weight="semibold" className="text-base text-textColor">
                    {periodType === "daily"
                      ? "Daily Spending"
                      : "Monthly Spending"}
                </Text>
                <View className="flex-row items-center gap-2">
                  <PeriodSelector
                    selectedPeriod={periodType}
                    onPeriodChange={setPeriodType}
                  />
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => {
                        if (periodType === "daily") {
                          setDailyViewMode("list");
                        } else {
                          setMonthlyViewMode("list");
                        }
                      }}
                      className={`rounded-lg border px-3 py-1.5 ${(periodType === "daily" ? dailyViewMode === "list" : monthlyViewMode === "list") ? "border-primary_400 bg-primary_100" : "border-grayLight/80 bg-white"}`}
                    >
                      <Ionicons
                        name="list-outline"
                        size={16}
                        color={
                          (
                            periodType === "daily"
                              ? dailyViewMode === "list"
                              : monthlyViewMode === "list"
                          )
                            ? COLORS.primary_400
                            : COLORS.textColor
                        }
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        if (periodType === "daily") {
                          setDailyViewMode("chart");
                        } else {
                          setMonthlyViewMode("chart");
                        }
                      }}
                      className={`rounded-lg border px-3 py-1.5 ${(periodType === "daily" ? dailyViewMode === "chart" : monthlyViewMode === "chart") ? "border-primary_400 bg-primary_100" : "border-grayLight/80 bg-white"}`}
                    >
                      <Ionicons
                        name="bar-chart-outline"
                        size={16}
                        color={
                          (
                            periodType === "daily"
                              ? dailyViewMode === "chart"
                              : monthlyViewMode === "chart"
                          )
                            ? COLORS.primary_400
                            : COLORS.textColor
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.dailyExpenseCard}>
                {periodType === "daily" ? (
                  dailyViewMode === "chart" ? (
                    <DailyExpenseChart
                      dailyExpenses={dailyExpensesArray}
                      isLoading={isDailyExpensesLoading}
                      formatCurrency={formatCurrency}
                    />
                  ) : (
                    <DailyExpenseList
                      dailyExpenses={dailyExpensesArray}
                      isLoading={isDailyExpensesLoading}
                      formatCurrency={formatCurrency}
                    />
                  )
                ) : monthlyViewMode === "chart" ? (
                  <MonthlyExpenseChart
                    monthlyExpenses={monthlyExpensesArray}
                    isLoading={isMonthlyExpensesLoading}
                    formatCurrency={formatCurrency}
                  />
                ) : (
                  <MonthlyExpenseList
                    monthlyExpenses={monthlyExpensesArray}
                    isLoading={isMonthlyExpensesLoading}
                    formatCurrency={formatCurrency}
                  />
                )}
              </View>
            </View>
          )}

          {/* Expense/Income List Section */}
          {(activeTab === "expense" || activeTab === "income") && (
            <View className="mt-8">
              <Text weight="semibold" className="text-base text-textColor">
                {activeTab === "expense" ? "Recent Expenses" : "Recent Income"}
              </Text>

              <View style={styles.expenseListCard}>
                <ExpenseList
                  expenses={activeTab === "expense" ? expensesArray : incomesArray}
                  isLoading={activeTab === "expense" ? isExpensesLoading : isIncomesLoading}
                  categoryColorMap={CATEGORY_COLOR_MAP}
                  categoryIconMap={CATEGORY_ICON_MAP}
                  categoryBgMap={CATEGORY_BG_COLOR_MAP}
                  formatCurrency={formatCurrency}
                  formatDate={formatExpenseDate}
                  type={activeTab}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      {isLoading && (
        <View
          style={{ paddingBottom: bottom }}
          className="absolute bottom-0  left-0 right-0 bg-white"
        >
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
            style={[styles.floatingButton, { bottom: 16 + bottom }]}
            onPress={() => router.push(addEntryRoute)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.floatingButton, { bottom: 16 + bottom }]}
        onPress={() => router.push(addEntryRoute)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <SlideUpModal
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        title="Select period"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
      >
        <View className="gap-2">
          {monthOptions.map((option) => {
            const isSelected = option.key === selectedMonthKey;
            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSelectedMonthKey(option.key);
                  setShowMonthPicker(false);
                }}
                className={`rounded-2xl px-4 py-3 ${isSelected ? "bg-primary_100" : "bg-white"}`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    weight="semibold"
                    className={`text-base text-textColor ${isSelected ? "text-primary_400" : ""}`}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary_400} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>
    </MainContainer>
  );
};

export default ExpensePlanningScreen;

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
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
  rankingCard: {
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  expenseListCard: {
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  dailyExpenseCard: {
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 24,
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
