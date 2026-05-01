import CompleteSetupCard from "@/components/home/CompleteSetupCard";
import ExpenseSummaryCard from "@/components/home/ExpenseSummaryCard";
import FinancialTipCard from "@/components/home/FinancialTipCard";
import QuickActions from "@/components/home/QuickActions";
import RecentTransactions from "@/components/home/RecentTransactions";
import WalletBalanceCard from "@/components/home/WalletBalanceCard";
import WelcomeHeader from "@/components/home/WelcomeHeader";
import MainContainer from "@/components/layouts/MainContainer";
import COLORS from "@/constants/colors";
import {
  buildExpenseSummaryFromList,
  formatCurrency as formatExpenseCurrency,
} from "@/features/expense-income/utils";
import { useSetupProgress } from "@/hooks/useSetupProgress";
import { useUserDisplayData } from "@/hooks/useUserDisplayData";
import {
  formatCurrencyWithSymbol,
  formatCurrentDate,
  transformTransaction,
} from "@/lib/utils";
import {
  useGetCategoriesQuery,
  useGetExpenseSummaryQuery,
  useGetIncomesQuery,
  useGetMonthlyExpensesQuery,
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
} from "@/src/api/hooks";
import { Image, ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SummaryCard = {
  id: string;
  label: string;
  amount: string;
  icon: ImageSource;
  accent: string;
  onPress: () => void;
};

type QuickAction = {
  id: string;
  label?: string;
  icon: ImageSource;
  background: string;
  aspectRatio?: 1;
};

const CURRENCY_SYMBOL = "₦";

const quickActions: QuickAction[] = [
  {
    id: "fx-rates",
    label: "FX Rates",
    icon: require("@/assets/icons/fxRates.svg"),
    background: "bg-white",
  },
  {
    id: "goals",
    label: "Savings Goals",
    icon: require("@/assets/icons/piggy.svg"),
    background: "bg-white",
  },
  {
    id: "more",
    icon: require("@/assets/icons/more-ellipsis.svg"),
    background: "bg-white",
    aspectRatio: 1,
  },
];

const HomeScreen = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const currencySymbol = CURRENCY_SYMBOL;
  const [balanceHidden, setBalanceHidden] = useState(false);
  const { initials, welcomeName } = useUserDisplayData();
  const { isSetupComplete, currentStepRoute } = useSetupProgress();
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useGetWalletBalanceQuery();
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useGetWalletTransactionsQuery();
  const {
    data: expenseSummaryData,
    isLoading: isLoadingExpenseSummary,
    refetch: refetchExpenseSummary,
  } = useGetExpenseSummaryQuery("monthly");
  const {
    data: incomesData,
    isLoading: isLoadingIncomes,
    refetch: refetchIncomes,
  } = useGetIncomesQuery();
  const { data: monthlyExpensesData, refetch: refetchMonthlyExpenses } =
    useGetMonthlyExpensesQuery();

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useGetCategoriesQuery("expense");

  const expenseSummary = useMemo(() => {
    if (!expenseSummaryData?.byCategory) return { total: 0, segments: [] };
    const categoryIcons = categoriesData ?? [];
    const summary = buildExpenseSummaryFromList(
      expenseSummaryData.byCategory,
      categoryIcons,
    );
    // Compute amounts from percentages
    let remaining = summary.total;
    const segments = summary.segments.map((segment, index, array) => {
      const amount =
        index === array.length - 1
          ? remaining
          : Math.round((summary.total * segment.percentage) / 100);
      remaining -= amount;
      return { ...segment, amount };
    });
    return { total: summary.total, segments };
  }, [expenseSummaryData, categoriesData]);

  const walletBalance = useMemo(() => {
    const balance = balanceData?.balance ?? 0;
    return typeof balance === "number" ? balance : 0;
  }, [balanceData]);

  const formattedBalance = useMemo(() => {
    if (balanceHidden) {
      return "••••••••";
    }
    if (isLoadingBalance) {
      return "Loading...";
    }
    return formatCurrencyWithSymbol(walletBalance, currencySymbol);
  }, [balanceHidden, currencySymbol, walletBalance, isLoadingBalance]);

  const totalExpenses = expenseSummaryData?.total || 0;

  const totalIncome = useMemo(() => {
    if (!incomesData?.data || !Array.isArray(incomesData.data)) return 0;
    return incomesData.data.reduce(
      (sum, income) => sum + (income.amount || 0),
      0,
    );
  }, [incomesData]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    const expenseAmount = isLoadingExpenseSummary
      ? "Loading..."
      : formatCurrencyWithSymbol(totalExpenses, currencySymbol);
    const incomeAmount = isLoadingIncomes
      ? "Loading..."
      : formatCurrencyWithSymbol(totalIncome, currencySymbol);

    return [
      {
        id: "expense",
        label: "Expense",
        amount: expenseAmount,
        icon: require("@/assets/icons/arrow-up.svg"),
        accent: "bg-peachTint",
        onPress: () => router.navigate("/expense-planning?tab=expense"),
      },
      {
        id: "income",
        label: "Income",
        amount: incomeAmount,
        icon: require("@/assets/icons/arrow-down.svg"),
        accent: "bg-secondary_100",
        onPress: () => router.navigate("/expense-planning?tab=income"),
      },
    ];
  }, [
    totalExpenses,
    totalIncome,
    currencySymbol,
    isLoadingExpenseSummary,
    isLoadingIncomes,
    router,
  ]);

  const balanceSubtitle = useMemo(() => {
    if (
      !monthlyExpensesData?.data ||
      !Array.isArray(monthlyExpensesData.data)
    ) {
      return null;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthData = monthlyExpensesData.data.find(
      (item) =>
        item._id.month === currentMonth && item._id.year === currentYear,
    );
    const previousMonthData = monthlyExpensesData.data.find(
      (item) =>
        item._id.month === previousMonth && item._id.year === previousYear,
    );

    const currentTotal = currentMonthData?.total ?? 0;
    const previousTotal = previousMonthData?.total ?? 0;

    if (previousTotal === 0) {
      return null;
    }

    const percentChange =
      ((currentTotal - previousTotal) / previousTotal) * 100;
    const absPercent = Math.abs(percentChange).toFixed(0);
    const direction = percentChange >= 0 ? "more" : "less";

    return `${absPercent}% ${direction} expenses than last month`;
  }, [monthlyExpensesData]);

  const currentDate = formatCurrentDate();

  const handleQuickActionPress = (action: QuickAction) => {
    switch (action.id) {
      case "fx-rates":
        router.navigate("/(app)/(home)/fxRates");
        break;
      case "goals":
        router.navigate("/savings-goals");
        break;
      case "more":
        router.navigate("/more");
        break;
      default:
        break;
    }
  };

  const recentTransactions = useMemo(() => {
    if (!transactionsData?.data || !Array.isArray(transactionsData.data)) {
      return [];
    }

    const transactions = transactionsData.data;
    if (transactions.length === 0) return [];

    return transactions.map(transformTransaction).slice(0, 4);
  }, [transactionsData]);
  const shouldShowEmpty = useMemo(() => {
    return recentTransactions.length === 0;
  }, [recentTransactions.length]);

  return (
    <>
      <MainContainer className="bg-light pb-0">
        <View className="flex-1">
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={
                  isLoadingBalance ||
                  isLoadingTransactions ||
                  isLoadingExpenseSummary ||
                  isLoadingIncomes ||
                  isLoadingCategories
                }
                onRefresh={() => {
                  refetchBalance();
                  refetchTransactions();
                  refetchExpenseSummary();
                  refetchIncomes();
                  refetchCategories();
                  refetchMonthlyExpenses();
                }}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <View className="bg-primary_200 pt-4">
              <WelcomeHeader
                initials={initials}
                welcomeName={welcomeName}
                currentDate={currentDate}
                onNotificationPress={() => router.navigate("/notifications")}
              />

              <WalletBalanceCard
                formattedBalance={formattedBalance}
                balanceHidden={balanceHidden}
                balanceSubtitle={balanceSubtitle}
                summaryCards={summaryCards}
                onToggleBalanceVisibility={() =>
                  setBalanceHidden((prev) => !prev)
                }
              />
            </View>
            <View className="bg-lightMuted px-6">
              {!isSetupComplete && (
                <CompleteSetupCard
                  onCompleteSetup={() => {
                    router.push(currentStepRoute as any);
                  }}
                />
              )}

              <QuickActions
                actions={quickActions}
                onActionPress={handleQuickActionPress}
              />

              <FinancialTipCard />

              <ExpenseSummaryCard
                segments={expenseSummary.segments}
                total={expenseSummary.total}
                isLoading={isLoadingExpenseSummary || isLoadingCategories}
                formatCurrency={formatExpenseCurrency}
                onPress={() => router.navigate("/expense-planning?tab=expense")}
              />

              <RecentTransactions
                transactions={recentTransactions}
                showEmpty={shouldShowEmpty}
              />
            </View>
          </ScrollView>

          <Pressable
            onPress={() => router.push("/(app)/ai-assistant")}
            accessibilityRole="button"
            accessibilityLabel="Open AI Assistant"
            className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-primary_400"
            style={{
              bottom: bottom + 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Image
              source={require("@/assets/icons/ai_bot.svg")}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
              tintColor={COLORS.white}
            />
          </Pressable>
        </View>
      </MainContainer>
    </>
  );
};

export default HomeScreen;
