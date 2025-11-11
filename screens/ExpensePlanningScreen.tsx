import {
  CategoryRanking,
  ExpenseChart,
  ExpenseList,
  TabSwitcher,
  type ChartSegment,
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
import {
  useGetExpenseSummaryQuery,
  useGetExpensesQuery,
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

const PERIOD_LABEL = "2025 Sep";

const ExpensePlanningScreen = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("expense");

  // Fetch expense data
  const {
    data: expenseSummaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetExpenseSummaryQuery("monthly", {
    enabled: activeTab === "expense",
  });

  const {
    data: expensesData,
    isLoading: isExpensesLoading,
    error,
    refetch: refetchExpenses,
  } = useGetExpensesQuery({
    enabled: activeTab === "expense",
  });

  console.log("error", error);

  const isLoading =
    activeTab === "expense" && (isSummaryLoading || isExpensesLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "expense") {
        await Promise.all([refetchSummary(), refetchExpenses()]);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTab, refetchSummary, refetchExpenses]);

  const tabConfig = useMemo(
    () => TAB_ITEMS.find((item) => item.key === activeTab)!,
    [activeTab],
  );

  const emptyStateContent = EMPTY_STATE_MESSAGES[activeTab];

  // Transform API summary data to UI format
  const currentSummary = useMemo(() => {
    if (activeTab === "expense" && expenseSummaryData) {
      // The API returns: { data: { type, total, byCategory: [...] } }
      // React Query returns: { data: ApiEnvelope<ExpenseSummary> }
      // So expenseSummaryData = { data: { type, total, byCategory: [...] } }

      const summaryData = (expenseSummaryData as any)?.data;
      const byCategory = summaryData?.byCategory;

      // Check if we have the byCategory array
      if (Array.isArray(byCategory) && byCategory.length > 0) {
        // Calculate total - use the total from API or sum the categories
        const total =
          summaryData.total ||
          byCategory.reduce(
            (sum: number, item: any) => sum + (item.total || 0),
            0,
          );

        // Transform to segments with percentages
        const segments: ChartSegment[] = byCategory.map(
          (item: any, index: number) => {
            const categoryName = item.category || "Other";
            const amount = item.total || 0;
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

            return {
              key: `${categoryName}-${index}`,
              label: categoryName,
              percentage: Math.round(percentage),
              color: CATEGORY_COLOR_MAP[categoryName] || "#5D5FFE",
              trackColor: CATEGORY_TRACK_COLOR_MAP[categoryName] || "#E6E7FF",
              icon: CATEGORY_ICON_MAP[categoryName] || "cash-outline",
              iconBackground: CATEGORY_BG_COLOR_MAP[categoryName] || "#F6F5FF",
              labelPosition,
              amount, // Use the actual amount from the API
            };
          },
        );

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
  }, [activeTab, expenseSummaryData]);

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
  const expensesArray = useMemo(() => {
    if (activeTab !== "expense") return [];
    return Array.isArray(expensesData)
      ? expensesData
      : (expensesData as any)?.data || [];
  }, [expensesData, activeTab]);
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

          {/* Expense List Section */}
          {activeTab === "expense" && (
            <View className="mt-8">
              <Text weight="semibold" className="text-base text-textColor">
                Recent Expenses
              </Text>

              <View style={styles.expenseListCard}>
                <ExpenseList
                  expenses={expensesArray}
                  isLoading={isExpensesLoading}
                  categoryColorMap={CATEGORY_COLOR_MAP}
                  categoryIconMap={CATEGORY_ICON_MAP}
                  categoryBgMap={CATEGORY_BG_COLOR_MAP}
                  formatCurrency={formatCurrency}
                  formatDate={formatExpenseDate}
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
