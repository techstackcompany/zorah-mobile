import CurrencySelectorModal from "@/components/home/CurrencySelectorModal";
import FinancialTipCard from "@/components/home/FinancialTipCard";
import FxRatesCard from "@/components/home/FxRatesCard";
import QuickActions from "@/components/home/QuickActions";
import RecentTransactions from "@/components/home/RecentTransactions";
import WalletBalanceCard from "@/components/home/WalletBalanceCard";
import WelcomeHeader from "@/components/home/WelcomeHeader";
import MainContainer from "@/components/layouts/MainContainer";
import { useUserDisplayData } from "@/hooks/useUserDisplayData";
import {
  formatCurrencyWithSymbol,
  formatCurrentDate,
  formatTransactionPurpose,
} from "@/lib/utils";
import { FX_PAIRS } from "@/constants/fx";
import {
  useGetExpenseSummaryQuery,
  useGetFxRatePairsQuery,
  useGetIncomesQuery,
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
} from "@/src/api/hooks";
import { WalletTransaction, FxRatePair } from "@/src/api/types";
import { ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

type CurrencyOption = {
  code: string;
  label: string;
  symbol: string;
  flag: ImageSource;
};

type SummaryCard = {
  id: string;
  label: string;
  amount: string;
  icon: ImageSource;
  accent: string;
};

type QuickAction = {
  id: string;
  label?: string;
  icon: ImageSource;
  background: string;
  aspectRatio?: 1;
};

type RecentTransactionItem = {
  id: string;
  title: string;
  category: string;
  amount: number;
  timeAgo: string;
  type: "income" | "expense";
  icon: ImageSource;
  accent: string;
};

const currencies: CurrencyOption[] = [
  {
    code: "NGN",
    label: "NGN - Nigerian (Naira)",
    symbol: "₦",
    flag: require("@/assets/icons/nigeria-flag-curved.svg"),
  },
  {
    code: "CAD",
    label: "CAD - Canadian (Dollar)",
    symbol: "$",
    flag: require("@/assets/icons/canada-flag-curved.svg"),
  },
  {
    code: "GHS",
    label: "GHS - Ghanaian (Cedi)",
    symbol: "₵",
    flag: require("@/assets/icons/ghana-flag-curved.svg"),
  },
];

const quickActions: QuickAction[] = [
  {
    id: "expense-income",
    label: "Expense & Income",
    icon: require("@/assets/icons/add-circle.svg"),
    background: "bg-white",
  },
  {
    id: "goals",
    label: "Set Goals",
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

// Helper function to format time ago
const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Helper function to get default icon and accent based on transaction type
const getTransactionIcon = (
  type: "credit" | "debit",
): {
  icon: ImageSource;
  accent: string;
} => {
  if (type === "credit") {
    return {
      icon: require("@/assets/images/home/salary.png"),
      accent: "#EEF5FF",
    };
  }
  return {
    icon: require("@/assets/images/home/shopping.png"),
    accent: "#FDECEF",
  };
};

// Transform API transaction to UI transaction
const transformTransactionForHome = (
  txn: WalletTransaction,
): RecentTransactionItem => {
  const isCredit = txn.type === "credit";
  const { icon, accent } = getTransactionIcon(txn.type as "credit" | "debit");
  const amount = isCredit ? Math.abs(txn.amount) : -Math.abs(txn.amount);

  return {
    id: txn._id,
    title:
      txn.description ||
      (txn.purpose
        ? formatTransactionPurpose(txn.purpose)
        : isCredit
          ? "Credit"
          : "Debit"),
    category: isCredit ? "Income" : "Expense",
    amount,
    timeAgo: formatTimeAgo(txn.createdAt),
    type: isCredit ? "income" : "expense",
    icon,
    accent,
  };
};

const HomeScreen = () => {
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyOption>(currencies[0]);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const hasInitializedCurrency = useRef(false);
  const { initials, welcomeName } = useUserDisplayData();
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

  const fxPairsToFetch = useMemo(
    () => [
      { base: "USD", quote: "NGN" },
      { base: "GBP", quote: "NGN" },
      { base: "EUR", quote: "NGN" },
      { base: "CAD", quote: "NGN" },
    ],
    [],
  );

  const {
    data: fxRatePairs,
    isLoading: isLoadingFxPairs,
    isFetching: isFetchingFxPairs,
    refetch: refetchFxPairs,
  } = useGetFxRatePairsQuery(fxPairsToFetch);

  const fxPairLookup = useMemo(() => {
    const lookup: { [key: string]: FxRatePair } = {};

    if (fxRatePairs) {
      fxRatePairs.forEach((pair) => {
        const key = `${pair.base}${pair.quote}`;
        lookup[key] = pair;
      });
    }

    return lookup;
  }, [fxRatePairs]);

  const resolvedFxPairs = useMemo(() => {
    return FX_PAIRS.map((pair) => {
      const key = `${pair.base}${pair.quote}`;
      const apiPair = fxPairLookup[key];

      if (apiPair && typeof apiPair.rate === "number" && apiPair.rate > 0) {
        return {
          ...pair,
          value: apiPair.rate,
          change: apiPair.change ?? 0,
        };
      }

      return {
        ...pair,
        value: 0,
        change: 0,
      };
    }).filter((pair) => pair.value > 0);
  }, [fxPairLookup]);

  const walletBalance = useMemo(() => {
    const balance = balanceData?.balance ?? 0;
    return typeof balance === "number" ? balance : 0;
  }, [balanceData]);
  
  useEffect(() => {
    if (
      balanceData?.currency &&
      !isLoadingBalance &&
      !hasInitializedCurrency.current
    ) {
      const currencyCode = balanceData.currency;
      const apiCurrencyOption = currencies.find((c) => c.code === currencyCode);
      if (apiCurrencyOption) {
        setCurrency(apiCurrencyOption);
        hasInitializedCurrency.current = true;
      }
    }
  }, [balanceData?.currency, isLoadingBalance]);

  const formattedBalance = useMemo(() => {
    if (balanceHidden) {
      return "••••••••";
    }
    if (isLoadingBalance) {
      return "Loading...";
    }
    return formatCurrencyWithSymbol(walletBalance, currency.symbol);
  }, [balanceHidden, currency.symbol, walletBalance, isLoadingBalance]);
  const totalExpenses = useMemo(() => {
    if (!expenseSummaryData?.data) return 0;
    return expenseSummaryData.data.total || 0;
  }, [expenseSummaryData]);
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
      : formatCurrencyWithSymbol(totalExpenses, currency.symbol);
    const incomeAmount = isLoadingIncomes
      ? "Loading..."
      : formatCurrencyWithSymbol(totalIncome, currency.symbol);

    return [
      {
        id: "expense",
        label: "Expense",
        amount: expenseAmount,
        icon: require("@/assets/icons/arrow-down.svg"),
        accent: "bg-peachTint",
      },
      {
        id: "income",
        label: "Income",
        amount: incomeAmount,
        icon: require("@/assets/icons/arrow-up.svg"),
        accent: "bg-secondary_100",
      },
    ];
  }, [
    totalExpenses,
    totalIncome,
    currency.symbol,
    isLoadingExpenseSummary,
    isLoadingIncomes,
  ]);

  const balanceSubtitle = "12% From Last Month";
  const currentDate = formatCurrentDate();

  const handleCurrencySelect = (option: CurrencyOption) => {
    setCurrency(option);
    setShowCurrencySheet(false);
  };
  const handleQuickActionPress = (action: QuickAction) => {
    switch (action.id) {
      case "expense-income":
        router.navigate("/expense-planning");
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

  // Transform and limit recent transactions (show latest 4)
  const recentTransactions = useMemo(() => {
    if (!transactionsData?.data || !Array.isArray(transactionsData.data)) {
      return [];
    }

    const transactions = transactionsData.data;
    if (transactions.length === 0) return [];

    return transactions.map(transformTransactionForHome).slice(0, 4);
  }, [transactionsData]);

  // Show empty state only when there are no transactions
  const shouldShowEmpty = useMemo(() => {
    return recentTransactions.length === 0;
  }, [recentTransactions.length]);

  return (
    <>
      <MainContainer edges={["top"]} className="bg-light pb-0">
        <View className="flex-1">
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={
                  isLoadingBalance ||
                  isLoadingTransactions ||
                  isLoadingExpenseSummary ||
                  isLoadingIncomes ||
                  isLoadingFxPairs ||
                  isFetchingFxPairs
                }
                onRefresh={() => {
                  refetchBalance();
                  refetchTransactions();
                  refetchExpenseSummary();
                  refetchIncomes();
                  refetchFxPairs();
                }}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            <View className="bg-primary_200 pt-4">
              <WelcomeHeader
                initials={initials}
                welcomeName={welcomeName}
                currentDate={currentDate}
              />

              <WalletBalanceCard
                formattedBalance={formattedBalance}
                balanceHidden={balanceHidden}
                currency={currency}
                balanceSubtitle={balanceSubtitle}
                summaryCards={summaryCards}
                onToggleBalanceVisibility={() =>
                  setBalanceHidden((prev) => !prev)
                }
                onCurrencyPress={() => setShowCurrencySheet(true)}
              />
            </View>
            <View className="bg-lightMuted px-6">
              <QuickActions
                actions={quickActions}
                onActionPress={handleQuickActionPress}
              />

              <FinancialTipCard />

              <FxRatesCard
                rates={resolvedFxPairs}
                isLoading={isLoadingFxPairs && resolvedFxPairs.length === 0}
              />

              <RecentTransactions
                transactions={recentTransactions}
                showEmpty={shouldShowEmpty}
              />
            </View>
          </ScrollView>
        </View>

        <CurrencySelectorModal
          visible={showCurrencySheet}
          currencies={currencies}
          selectedCurrency={currency}
          onClose={() => setShowCurrencySheet(false)}
          onSelect={handleCurrencySelect}
        />
      </MainContainer>
    </>
  );
};

export default HomeScreen;
