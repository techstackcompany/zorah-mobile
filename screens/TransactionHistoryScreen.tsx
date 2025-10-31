import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
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
  icon: ImageSource;
  accent: string;
};

type TransactionSection = {
  id: string;
  title: string;
  items: TransactionItem[];
};

type TransactionTab = "all" | "income" | "expense";

const transactionSections: TransactionSection[] = [
  {
    id: "sep-2025",
    title: "Sep 2025",
    items: [
      {
        id: "txn-jollof",
        title: "Jollof Rice at Mama Cass",
        description: "Lunch with colleagues",
        account: "GTBank",
        timeAgo: "2h ago",
        amount: -2500,
        type: "expense",
        icon: require("@/assets/images/home/food.png"),
        accent: "#FDECEF",
      },
      {
        id: "txn-uber",
        title: "Uber to Victoria Island",
        account: "Opay",
        timeAgo: "4h ago",
        amount: -1800,
        type: "expense",
        icon: require("@/assets/images/home/transport.png"),
        accent: "#EEF2FF",
      },
    ],
  },
  {
    id: "yesterday",
    title: "Yesterday",
    items: [
      {
        id: "txn-salary",
        title: "Salary Payment",
        account: "Zenith Bank",
        timeAgo: "1d ago",
        amount: 333000,
        type: "income",
        icon: require("@/assets/images/home/salary.png"),
        accent: "#E6F5F3",
      },
      {
        id: "txn-bonus",
        title: "Bonus Payout",
        account: "GTBank",
        timeAgo: "1d ago",
        amount: 88900,
        type: "income",
        icon: require("@/assets/images/home/bonus.png"),
        accent: "#FFF7E6",
      },
      {
        id: "txn-pos",
        title: "POS Withdrawal",
        account: "Cash",
        timeAgo: "1d ago",
        amount: -15800,
        type: "expense",
        icon: require("@/assets/images/home/shopping.png"),
        accent: "#FDECEF",
      },
      {
        id: "txn-nepa",
        title: "NEPA Bill",
        account: "Zenith Bank",
        timeAgo: "1d ago",
        amount: -11200,
        type: "expense",
        icon: require("@/assets/images/home/call.png"),
        accent: "#E8EFFF",
      },
    ],
  },
  {
    id: "friday",
    title: "Friday",
    items: [
      {
        id: "txn-wedding",
        title: "Wedding Aso-ebi",
        account: "Kuda",
        timeAgo: "2d ago",
        amount: -25000,
        type: "expense",
        icon: require("@/assets/images/home/entertainment.png"),
        accent: "#FFF0F1",
      },
      {
        id: "txn-shoprite",
        title: "Shoprite Groceries",
        account: "GTBank",
        timeAgo: "2d ago",
        amount: -15750,
        type: "expense",
        icon: require("@/assets/images/home/food.png"),
        accent: "#FFF2E9",
      },
    ],
  },
  {
    id: "thursday",
    title: "Thursday",
    items: [
      {
        id: "txn-cinema",
        title: "Cinema Ticket - Mufasa Lion King",
        account: "Opay",
        timeAgo: "3d ago",
        amount: -15800,
        type: "expense",
        icon: require("@/assets/images/home/entertainment.png"),
        accent: "#FEEBF7",
      },
      {
        id: "txn-checkup",
        title: "Medical Checkup",
        account: "Cash",
        timeAgo: "3d ago",
        amount: -15800,
        type: "expense",
        icon: require("@/assets/images/home/transport.png"),
        accent: "#E5F4FF",
      },
      {
        id: "txn-food-drink",
        title: "Food & Drink",
        account: "Opay",
        timeAgo: "3d ago",
        amount: -11200,
        type: "expense",
        icon: require("@/assets/images/home/food.png"),
        accent: "#FFF2E9",
      },
    ],
  },
];

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

const formatCurrency = (value: number) =>
  `₦${value.toLocaleString("en-NG", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;

const formatAmountWithSign = (value: number) => {
  if (value === 0) {
    return formatCurrency(0);
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
};

const buildSections = (tab: TransactionTab) => {
  return transactionSections
    .map((section) => {
      const items =
        tab === "all"
          ? section.items
          : section.items.filter((item) => item.type === tab);

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

  const sections = useMemo(() => buildSections(activeTab), [activeTab]);

  const backgroundClass =
    activeTab === "income"
      ? "bg-primary_100"
      : activeTab === "expense"
        ? "bg-lightMuted"
        : "bg-light";

  const handleTransactionPress = (transactionId: string) => {
    router.push("/transactions/details");
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
        "flex-row items-center rounded-lg border border-grayLight/80 px-4 gap-2",
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
                <Image
                  source={require("@/assets/icons/mic.svg")}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: COLORS.primary_400,
                  }}
                  contentFit="contain"
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
          >
            <View className="px-6">
              {sections.map((section) => (
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
                        <View
                          className="mr-3 size-12 items-center justify-center rounded-full"
                          style={{ backgroundColor: item.accent }}
                        >
                          <Image
                            source={item.icon}
                            style={{ width: 26, height: 26 }}
                            contentFit="contain"
                          />
                        </View>
                        <View className="flex-1 pe-2">
                          <Text
                            weight="semibold"
                            numberOfLines={1}
                            className="text-lg"
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
              ))}
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
