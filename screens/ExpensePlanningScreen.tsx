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
} from "@/components/expense-planning";

import MainContainer from "@/components/layouts/MainContainer";
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  EMPTY_STATE_MESSAGES,
  PERIOD_OPTIONS,
  TAB_ITEMS,
} from "@/features/expense-income/constants";
import { PeriodType, TabKey } from "@/features/expense-income/types";
import {
  buildExpenseSummaryFromList,
  formatCurrency,
  formatExpenseDate,
} from "@/features/expense-income/utils";

import {
  useGetCategoriesQuery,
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useGetIncomesQuery,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MonthOption = {
  key: string;
  label: string;
  month?: number;
  year?: number;
};

const ExpensePlanningScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bottom } = useSafeAreaInsets();

  const activeTab = (params.tab as TabKey) || "expense";

  const [dailyViewMode, setDailyViewMode] = useState<"chart" | "list">("list");
  const [monthlyViewMode, setMonthlyViewMode] = useState<"chart" | "list">(
    "list",
  );
  const [periodType, setPeriodType] = useState<PeriodType>("daily");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("all");
  const monthPickerModalRef = useRef<SlideUpModalRef>(null);
  const periodModalRef = useRef<SlideUpModalRef>(null);

  const {
    data: expenseSummaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetExpenseSummaryQuery("monthly");

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoryError,
  } = useGetCategoriesQuery(activeTab);

  const {
    data: expensesData,
    isLoading: isExpensesLoading,
    error: expenseError,
    refetch: refetchExpenses,
  } = useGetExpensesQuery();

  const {
    data: incomesData,
    isLoading: isIncomesLoading,
    error: incomeError,
    refetch: refetchIncomes,
  } = useGetIncomesQuery();

  const isLoading =
    (activeTab === "expense" && (isSummaryLoading || isExpensesLoading)) ||
    (activeTab === "income" && isIncomesLoading) ||
    isCategoriesLoading;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "expense") {
        const promises = [refetchSummary(), refetchExpenses()];
        await Promise.all(promises);
      } else if (activeTab === "income") {
        await refetchIncomes();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTab, refetchSummary, refetchExpenses, refetchIncomes]);

  const handleSelect = (period: PeriodType) => {
    setPeriodType(period);
    periodModalRef.current?.dismiss();
  };
  const selectedOption =
    PERIOD_OPTIONS.find((opt) => opt.value === periodType) || PERIOD_OPTIONS[0];
  console.log("activeTab", activeTab);
  const tabConfig = useMemo(
    () => TAB_ITEMS.find((item) => item.key === activeTab) || {},
    [activeTab],
  );

  const emptyStateContent = EMPTY_STATE_MESSAGES[activeTab];

  const expensesArray = useMemo(() => {
    if (activeTab !== "expense") return [];
    if (!expensesData) return [];
    return Array.isArray(expensesData?.data) ? expensesData.data : [];
  }, [expensesData, activeTab]);

  const monthOptions = useMemo<MonthOption[]>(() => {
    const seen = new Set<string>();
    const options: MonthOption[] = [];

    expensesArray.forEach((exp) => {
      const rawDate = exp.date;
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
      options.push({
        key,
        label,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      });
    });

    options.sort((a, b) => {
      if (!a.year || !a.month || !b.year || !b.month) return 0;
      return (
        new Date(b.year, b.month - 1).getTime() -
        new Date(a.year, a.month - 1).getTime()
      );
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
      const rawDate = exp.date;
      const d = new Date(rawDate);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === year &&
        d.getMonth() + 1 === month
      );
    });
  }, [expensesArray, selectedMonthKey]);

  const categoryIconsData = useMemo(
    () => (categoriesData ? categoriesData : []),
    [categoriesData],
  );

  const currentSummary = useMemo(() => {
    let list;

    if (activeTab === "expense") {
      if (selectedMonthKey === "all" && expenseSummaryData?.byCategory) {
        list = expenseSummaryData.byCategory;
      } else {
        list = filteredExpenses || [];
      }
    } else if (activeTab === "income") {
      const rawIncomes = Array.isArray(incomesData?.data)
        ? incomesData.data
        : [];

      let filteredIncomes = rawIncomes;

      if (selectedMonthKey !== "all") {
        const [yearStr, monthStr] = selectedMonthKey.split("-");
        const month = Number(monthStr);
        const year = Number(yearStr);

        if (Number.isFinite(month) && Number.isFinite(year)) {
          filteredIncomes = rawIncomes.filter((income: any) => {
            const rawDate = income.date || income.createdAt;
            const d = new Date(rawDate);
            return (
              !Number.isNaN(d.getTime()) &&
              d.getFullYear() === year &&
              d.getMonth() + 1 === month
            );
          });
        }
      }

      const categoryMap = new Map<string, number>();
      filteredIncomes.forEach((income: any) => {
        const category = income.category || "Other";
        const amount = income.amount || 0;
        categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
      });

      list = Array.from(categoryMap.entries()).map(([category, total]) => ({
        category,
        total,
      }));
    }

    return buildExpenseSummaryFromList(list || [], categoryIconsData);
  }, [
    activeTab,
    categoryIconsData,
    expenseSummaryData,
    filteredExpenses,
    incomesData?.data,
    selectedMonthKey,
  ]);

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

  const incomesArray = useMemo(() => {
    if (activeTab !== "income") return [];
    const rawIncomes = Array.isArray(incomesData?.data) ? incomesData.data : [];

    return rawIncomes.map((income: any) => {
      const category = income.category || "Other";
      const capitalizedCategory =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      return {
        _id: income._id,
        id: income._id,
        amount: income.amount || 0,
        category: capitalizedCategory,
        description: income.description,
        paymentMethod: income.source,
        date: income.date || income.createdAt,
        createdAt: income.createdAt,
        updatedAt: income.updatedAt,
      };
    });
  }, [incomesData, activeTab]);

  const dailyExpensesArray = useMemo(() => {
    if (activeTab !== "expense" || periodType !== "daily") return [];
    const byDay = new Map<
      string,
      { _id: { day: number; month: number; year: number }; total: number }
    >();

    filteredExpenses.forEach((expense: any) => {
      const rawDate = expense.date || expense.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const total = byDay.get(key)?.total || 0;
      byDay.set(key, {
        _id: {
          day: d.getDate(),
          month: d.getMonth() + 1,
          year: d.getFullYear(),
        },
        total: total + Math.abs(expense.amount || 0),
      });
    });

    return Array.from(byDay.values());
  }, [activeTab, filteredExpenses, periodType]);

  const monthlyExpensesArray = useMemo(() => {
    if (activeTab !== "expense" || periodType !== "monthly") return [];
    const byMonth = new Map<
      string,
      { _id: { month: number; year: number }; total: number }
    >();

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
    <>
      <MainContainer className="bg-lightMuted pb-0" edges={[]}>
        {(expenseError || incomeError || categoryError) && (
          <View
            style={{
              padding: 16,
              backgroundColor: "#FFF0F0",
              borderRadius: 12,
              margin: 16,
            }}
          >
            <Text className="mb-2 text-center text-red-500" weight="semibold">
              {expenseError?.message ||
                incomeError?.message ||
                categoryError?.message ||
                "An error occurred."}
            </Text>
            <TouchableOpacity
              style={{
                alignSelf: "center",
                backgroundColor: COLORS.primary_400,
                borderRadius: 8,
                paddingHorizontal: 18,
                paddingVertical: 8,
              }}
              activeOpacity={0.8}
              onPress={handleRefresh}
            >
              <Text className="text-white" weight="semibold">
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="px-6">
            <TabSwitcher
              tabs={TAB_ITEMS}
              activeTab={activeTab}
              onTabChange={(tab) => router.setParams({ tab })}
            />
            <CollapsibleCard
              headerBottomBorder
              title={tabConfig?.categoryTitle}
              style={styles.card}
            >
              <View className="flex-row items-center justify-between p-5">
                <Text weight="medium" className="text-sm text-textColor/70">
                  {tabConfig?.breakdownTitle}
                </Text>
                <Pressable
                  style={styles.periodPill}
                  onPress={() => monthPickerModalRef.current?.present()}
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
                      selectedOption={selectedOption}
                      onPress={() => periodModalRef.current?.present()}
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
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                      />
                    ) : (
                      <DailyExpenseList
                        dailyExpenses={dailyExpensesArray}
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                      />
                    )
                  ) : monthlyViewMode === "chart" ? (
                    <MonthlyExpenseChart
                      monthlyExpenses={monthlyExpensesArray}
                      isLoading={isLoading}
                      formatCurrency={formatCurrency}
                    />
                  ) : (
                    <MonthlyExpenseList
                      monthlyExpenses={monthlyExpensesArray}
                      isLoading={isLoading}
                      formatCurrency={formatCurrency}
                    />
                  )}
                </View>
              </View>
            )}

            {(activeTab === "expense" || activeTab === "income") && (
              <View className="mt-8">
                <Text weight="semibold" className="text-base text-textColor">
                  {activeTab === "expense"
                    ? "Recent Expenses"
                    : "Recent Income"}
                </Text>

                <View style={styles.expenseListCard}>
                  <ExpenseList
                    categoryIconsData={categoryIconsData}
                    expenses={
                      activeTab === "expense" ? expensesArray : incomesArray
                    }
                    isLoading={
                      activeTab === "expense"
                        ? isExpensesLoading
                        : isIncomesLoading
                    }
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
      </MainContainer>
      <SlideUpModal
        ref={monthPickerModalRef}
        onClose={() => {}}
        title="Select period"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        snapPoints={["50%"]}
      >
        <View className="h-full gap-2">
          {monthOptions.map((option) => {
            const isSelected = option.key === selectedMonthKey;
            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSelectedMonthKey(option.key);
                  monthPickerModalRef.current?.dismiss();
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
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.primary_400}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>
      <SlideUpModal
        ref={periodModalRef}
        onClose={() => {}}
        title="Select Period"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        className="gap-2"
        snapPoints={["30%"]}
      >
        {PERIOD_OPTIONS.map((option) => {
          const isSelected = option.value === periodType;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${isSelected ? "bg-primary_100" : "bg-white"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? COLORS.primary_400 : COLORS.textColor}
                />
                <Text
                  weight={isSelected ? "semibold" : "medium"}
                  className={`text-sm ${isSelected ? "text-primary_400" : "text-textColor"}`}
                >
                  {option.label}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.primary_400}
                />
              )}
            </Pressable>
          );
        })}
      </SlideUpModal>
    </>
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
