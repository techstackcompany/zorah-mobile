import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn, formatCurrency, formatTransactionPurpose } from "@/lib/utils";
import { useGetWalletTransactionsQuery } from "@/src/api/hooks";
import { WalletTransaction } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

type TransactionType = "income" | "expense";

type TransactionItem = {
  id: string;
  title: string;
  description?: string;
  account: string;
  timeAgo: string;
  amount: number;
  type: TransactionType;
 
};

type TransactionSection = {
  id: string;
  title: string;
  items: TransactionItem[];
};

type TransactionTab = "all" | "income" | "expense";

const transactionTabs: { id: TransactionTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
];

const filterCategories = [
  { id: "all", label: "All Categories" },
  { id: "food-drink", label: "Food & Drink" },
  { id: "transport", label: "Transportation" },
  { id: "shopping", label: "Shopping" },
  { id: "bills", label: "Bills & Utility" },
  { id: "entertainment", label: "Entertainment" },
  { id: "healthcare", label: "Healthcare" },
  { id: "pos", label: "POS Charges" },
  { id: "transfer", label: "Transfer" },
  { id: "salary", label: "Salary" },
  { id: "owambe", label: "Owambe" },
  { id: "business", label: "Business" },
  { id: "investment", label: "Investment" },
  { id: "others", label: "Others" },
] as const;

const filterDateRanges = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "this-week", label: "This week" },
  { id: "last-week", label: "Last Week" },
  { id: "this-month", label: "This Month" },
  { id: "last-month", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
] as const;

const filterAccounts = [
  { id: "all", label: "All Accounts" },
  { id: "gtbank", label: "GTBank" },
  { id: "zenith", label: "Zenith Bank" },
  { id: "kuda", label: "Kuda" },
  { id: "opay", label: "Opay" },
  { id: "cash", label: "Cash" },
  { id: "pos-business", label: "POS Business" },
] as const;

type FilterCategoryId = (typeof filterCategories)[number]["id"];
type FilterDateRangeId = (typeof filterDateRanges)[number]["id"];
type FilterAccountId = (typeof filterAccounts)[number]["id"];

const formatAmountWithSign = (value: number) => {
  if (value === 0) {
    return formatCurrency(0);
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
};

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

const formatSectionDate = (dateString?: string): string => {
  if (!dateString) return "Unknown";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const transactionDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (transactionDate.getTime() === today.getTime()) {
      return "Today";
    }
    if (transactionDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }

    const daysDiff = Math.floor(
      (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff < 7 && daysDiff > 0) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return dayNames[date.getDay()];
    }

    // Otherwise return month and year
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
};


const transformTransactionForUI = (
  txn: WalletTransaction,
): TransactionItem & { createdAt?: string } => {
  const isCredit = txn.type === "credit";
  const amount = isCredit ? Math.abs(txn.amount) : -Math.abs(txn.amount);

  const title =
    txn.description ||
    (txn.purpose
      ? formatTransactionPurpose(txn.purpose)
      : isCredit
        ? "Credit"
        : "Debit");

  return {
    id: txn._id,
    title,
    description: undefined,
    account: "Wallet",
    timeAgo: formatTimeAgo(txn.createdAt),
    amount,
    type: isCredit ? "income" : "expense",
   
    createdAt: txn.createdAt,
  };
};

const groupTransactionsByDate = (
  transactions: (TransactionItem & { createdAt?: string })[],
): TransactionSection[] => {
  const grouped = new Map<
    string,
    (TransactionItem & { createdAt?: string })[]
  >();

  transactions.forEach((txn) => {
    const dateKey = txn.createdAt
      ? new Date(txn.createdAt).toISOString().split("T")[0]
      : "unknown";
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(txn);
  });

  return Array.from(grouped.entries())
    .map(([dateKey, items]) => {
      const firstDate = items[0]?.createdAt || dateKey;
      return {
        id: dateKey,
        title: formatSectionDate(firstDate),
        items: items
          .map(({ createdAt, ...item }) => item) 
          .sort((a, b) => {
            const aTime = a.timeAgo;
            const bTime = b.timeAgo;
            if (aTime.includes("ago") && !bTime.includes("ago")) return -1;
            if (!aTime.includes("ago") && bTime.includes("ago")) return 1;
            return 0;
          }),
      };
    })
    .sort((a, b) => {
      if (a.title === "Today") return -1;
      if (b.title === "Today") return 1;
      if (a.title === "Yesterday") return -1;
      if (b.title === "Yesterday") return 1;
      return 0;
    });
};

const filterTransactionsBySearch = (
  items: TransactionItem[],
  searchTerm: string,
): TransactionItem[] => {
  if (!searchTerm.trim()) {
    return items;
  }

  const searchLower = searchTerm.toLowerCase().trim();

  return items.filter((item) => {
    if (item.title.toLowerCase().includes(searchLower)) {
      return true;
    }

    if (item.description?.toLowerCase().includes(searchLower)) {
      return true;
    }

    if (item.account.toLowerCase().includes(searchLower)) {
      return true;
    }

    const amountStr = formatCurrency(Math.abs(item.amount));
    if (amountStr.toLowerCase().includes(searchLower)) {
      return true;
    }

    if (Math.abs(item.amount).toString().includes(searchLower)) {
      return true;
    }

    return false;
  });
};

const buildSections = (
  sections: TransactionSection[],
  tab: TransactionTab,
  searchTerm: string,
) => {
  return sections
    .map((section) => {
      let items =
        tab === "all"
          ? section.items
          : section.items.filter((item) => item.type === tab);

      items = filterTransactionsBySearch(items, searchTerm);

      if (!items.length) {
        return null;
      }

      const total = items.reduce((sum, item) => sum + item.amount, 0);
      const isPositive = total >= 0;
      const netLabel = isPositive ? "Net Income" : "Net Expense";

      return {
        ...section,
        items,
        summary: {
          total: Math.abs(total),
          label: netLabel,
          color: isPositive ? COLORS.secondary_500 : "#D14343",
          transactionCount: items.length,
        },
      };
    })
    .filter(Boolean) as (TransactionSection & {
    summary: {
      total: number;
      label: string;
      color: string;
      transactionCount: number;
    };
  })[];
};

const TransactionHistoryScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TransactionTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<
    FilterCategoryId[]
  >(["all"]);
  const [selectedDateRange, setSelectedDateRange] =
    useState<FilterDateRangeId>("all");
  const [selectedAccounts, setSelectedAccounts] = useState<FilterAccountId[]>([
    "all",
  ]);

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useGetWalletTransactionsQuery();

  const transactionSections = useMemo(() => {
    if (!transactionsData?.data || !Array.isArray(transactionsData.data)) {
      return [];
    }

    const transactions = transactionsData.data;
    if (transactions.length === 0) return [];

    const transformed = transactions.map(transformTransactionForUI);
    return groupTransactionsByDate(transformed);
  }, [transactionsData]);

  const sections = useMemo(
    () => buildSections(transactionSections, activeTab, searchTerm),
    [transactionSections, activeTab, searchTerm],
  );

  const backgroundClass =
    activeTab === "income"
      ? "bg-primary_100"
      : activeTab === "expense"
        ? "bg-lightMuted"
        : "bg-light";

  const handleTransactionPress = (transactionId: string) => {
    if (!transactionId) return;
    router.push({
      pathname: "/transactions/details",
      params: { id: transactionId },
    });
  };

  const toggleCategory = (id: FilterCategoryId) => {
    setSelectedCategories((prev) => {
      if (id === "all") {
        return ["all"];
      }
      const next = prev.includes(id)
        ? prev.filter((value) => value !== id)
        : [...prev.filter((value) => value !== "all"), id];
      return next.length ? next : ["all"];
    });
  };

  const toggleAccount = (id: FilterAccountId) => {
    setSelectedAccounts((prev) => {
      if (id === "all") {
        return ["all"];
      }
      const next = prev.includes(id)
        ? prev.filter((value) => value !== id)
        : [...prev.filter((value) => value !== "all"), id];
      return next.length ? next : ["all"];
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories(["all"]);
    setSelectedAccounts(["all"]);
    setSelectedDateRange("all");
  };

  const FilterChip = ({
    label,
    active,
    onPress,
    compact,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
    compact?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-2 rounded-lg border border-grayLight/80 px-4",
        compact ? "py-2" : "py-3",
        active ? "bg-primary_100" : "bg-white",
      )}
      accessibilityRole="button"
    >
      {active ? (
        <Ionicons name="checkmark" size={14} color={COLORS.primary_400} />
      ) : null}
      <Text
        weight="semibold"
        className={cn(
          "text-xs",
          active ? "text-primary_400" : "text-textColor",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <>
      <MainContainer edges={[]} className={cn("pb-0", backgroundClass)}>
        <View className="flex-1">
          <View className="px-6 pt-4">
            <View className="mt-6 flex-row items-center gap-3">
              <View className="h-14 flex-1 flex-row items-center  rounded-lg border border-grayLight/80 px-4">
                <Image
                  source={require("@/assets/icons/search.svg")}
                  style={{ width: 24, height: 24, tintColor: "#8391A1" }}
                  contentFit="contain"
                />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search transactions..."
                  placeholderTextColor="#A0A8B2"
                  className="ml-3 flex-1 font-degular text-xl text-textColor"
                />
              </View>
              <Pressable
                onPress={() => setIsFilterVisible(true)}
                className="h-14 w-14 items-center justify-center rounded-lg border border-grayLight/80"
                accessibilityRole="button"
              >
                <Image
                  source={require("@/assets/icons/filter.svg")}
                  style={{ width: 20, height: 20, tintColor: COLORS.textColor }}
                  contentFit="contain"
                />
              </Pressable>
            </View>

            <View className="mt-5 flex-row rounded-full bg-grayLight p-1">
              {transactionTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const activeStyle: ViewStyle = isActive
                  ? {
                      backgroundColor: "#FFFFFF",
                      shadowColor: "#1A43BE",
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 2,
                    }
                  : {};
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 items-center justify-center rounded-full py-3",
                      isActive ? "bg-white" : "bg-transparent",
                    )}
                    style={activeStyle}
                    accessibilityRole="button"
                  >
                    <Text
                      weight="semibold"
                      className={cn(
                        "",
                        isActive ? "text-textColor" : "text-textColor/60",
                      )}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ScrollView
            className="mt-6 flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingTransactions}
                onRefresh={refetchTransactions}
              />
            }
          >
            <View className="px-6">
              {isLoadingTransactions && sections.length === 0 ? (
                <View className="mt-8 items-center justify-center py-8">
                  <ActivityIndicator size="large" color={COLORS.primary_400} />
                  <Text className="mt-4 text-textColor/60">
                    Loading transactions...
                  </Text>
                </View>
              ) : sections.length === 0 ? (
                <View className="mt-8 items-center justify-center py-8">
                  <Image
                    source={require("@/assets/images/home/no-recent-trans.svg")}
                    style={{ width: 170, height: 162 }}
                    contentFit="contain"
                  />
                  <Text
                    weight="semibold"
                    className="mt-4 text-base text-textColor"
                  >
                    No transactions found
                  </Text>
                  <Text className="mt-1 text-center text-sm text-textColor/60">
                    Your transaction history will appear here
                  </Text>
                </View>
              ) : (
                sections.map((section) => (
                  <View
                    key={section.id}
                    className="mb-6 rounded-lg border border-grayLight bg-white "
                  >
                    <View className="mb-3 flex-row items-end justify-between  border-b border-grayLight p-4">
                      <View className="">
                        <Text
                          weight="semibold"
                          className="text-base text-textColor"
                        >
                          {section.title}
                        </Text>
                        <Text className="text-xs text-textColor/60">
                          {section.summary.transactionCount}{" "}
                          {section.summary.transactionCount === 1
                            ? "transaction"
                            : "transactions"}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text
                          weight="semibold"
                          className="text-base text-textColor"
                          style={{ color: section.summary.color }}
                        >
                          {formatCurrency(section.summary.total)}
                        </Text>
                        <Text className="text-sm">{section.summary.label}</Text>
                      </View>
                    </View>

                    <View className="gap-3">
                      {section.items.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => handleTransactionPress(item.id)}
                          className="flex-row items-center rounded-3xl bg-white px-4 py-4"
                        >
                        
                          <View className="flex-1 pe-2">
                            <Text
                              weight="semibold"
                              numberOfLines={1}
                              className="text-lg capitalize"
                            >
                              {item.title}
                            </Text>
                            <Text className="mt-1 text-sm text-textColor/60">
                              {item.account} • {item.timeAgo}
                            </Text>
                            {item.description ? (
                              <Text
                                italic
                                className="mt-1 text-xs text-textColor/60"
                              >
                                {item.description}
                              </Text>
                            ) : null}
                          </View>
                          <View className="items-end">
                            <Text
                              weight="semibold"
                              className={cn(
                                "text-base",
                                item.type === "income"
                                  ? "text-secondary_500"
                                  : "text-[#D14343]",
                              )}
                            >
                              {formatAmountWithSign(item.amount)}
                            </Text>
                            <Text className="mt-1 text-xs text-textColor/40">
                              {item.type === "income" ? "Income" : "Expense"}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </MainContainer>

      <SlideUpModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        title="Filter Transactions"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
        closeIconColor="#FFFFFF"
        className="bg-lightMuted pb-6"
      >
        <View className="gap-6">
          <View>
            <Text weight="semibold" className="text-base text-textColor">
              Category
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {filterCategories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.label}
                  active={selectedCategories.includes(category.id)}
                  onPress={() => toggleCategory(category.id)}
                />
              ))}
            </View>
          </View>

          <View>
            <Text weight="semibold" className="text-base text-textColor">
              Date Range
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {filterDateRanges.map((range) => (
                <FilterChip
                  key={range.id}
                  label={range.label}
                  active={selectedDateRange === range.id}
                  onPress={() => setSelectedDateRange(range.id)}
                  compact
                />
              ))}
            </View>
          </View>

          <View>
            <Text weight="semibold" className="text-base text-textColor">
              Account Type
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {filterAccounts.map((account) => (
                <FilterChip
                  key={account.id}
                  label={account.label}
                  active={selectedAccounts.includes(account.id)}
                  onPress={() => toggleAccount(account.id)}
                  compact
                />
              ))}
            </View>
          </View>

          <View className="mt-2 flex-row gap-3">
            <Pressable
              onPress={handleClearFilters}
              className="flex-1 items-center justify-center rounded-lg border border-primary_400 py-3"
              accessibilityRole="button"
            >
              <Text weight="semibold" className="text-primary_400">
                Clear All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setIsFilterVisible(false)}
              className="flex-1 items-center justify-center rounded-lg bg-primary_400 py-3"
              accessibilityRole="button"
            >
              <Text weight="semibold" className="text-white">
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </View>
      </SlideUpModal>
    </>
  );
};

export default TransactionHistoryScreen;
