import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground, ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

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

type FxRate = {
  id: string;
  pair: string;
  code: string;
  change: number;
  price: string;
  flags: [ImageSource, ImageSource];
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

const summaryCards: SummaryCard[] = [
  {
    id: "expense",
    label: "Expense",
    amount: "₦0.00",
    icon: require("@/assets/icons/arrow-down.svg"),
    accent: "bg-peachTint",
  },
  {
    id: "income",
    label: "Income",
    amount: "₦0.00",
    icon: require("@/assets/icons/arrow-up.svg"),
    accent: "bg-secondary_100",
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

const fxRates: FxRate[] = [
  {
    id: "cadngn",
    pair: "CAD/NGN",
    code: "CADNGN",
    change: 2.5,
    price: "1,650.10",
    flags: [
      require("@/assets/icons/canada-flag-curved.svg"),
      require("@/assets/icons/nigeria-flag-curved.svg"),
    ],
  },
  {
    id: "cadghs",
    pair: "CAD/GHS",
    code: "CADGHS",
    change: -0.2,
    price: "589.42",
    flags: [
      require("@/assets/icons/canada-flag-curved.svg"),
      require("@/assets/icons/ghana-flag-curved.svg"),
    ],
  },
  {
    id: "ghsngn",
    pair: "GHS/NGN",
    code: "GHSNGN",
    change: -0.2,
    price: "85.33",
    flags: [
      require("@/assets/icons/ghana-flag-curved.svg"),
      require("@/assets/icons/nigeria-flag-curved.svg"),
    ],
  },
];

const recentTransactions: RecentTransactionItem[] = [
  {
    id: "salary-credit",
    title: "Salary Credit",
    category: "Income",
    amount: 400_650,
    timeAgo: "10 min ago",
    type: "income",
    icon: require("@/assets/images/home/salary.png"),
    accent: "#EEF5FF",
  },
  {
    id: "investment",
    title: "Investment",
    category: "Income",
    amount: 150_000,
    timeAgo: "1 hour ago",
    type: "income",
    icon: require("@/assets/images/home/investment.png"),
    accent: "#F9EBFF",
  },
  {
    id: "shoprite-grocery",
    title: "Shoprite Grocery",
    category: "Food & Drinks",
    amount: -1_650,
    timeAgo: "1 hour ago",
    type: "expense",
    icon: require("@/assets/images/home/shopping.png"),
    accent: "#FDECEF",
  },
  {
    id: "uber-ride",
    title: "Uber Ride",
    category: "Transportation",
    amount: -2_080,
    timeAgo: "2 hours ago",
    type: "expense",
    icon: require("@/assets/images/home/transport.png"),
    accent: "#ECFFF4",
  },
];

const HomeScreen = () => {
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyOption>(currencies[0]);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showEmptyTransactions, setShowEmptyTransactions] = useState(true);

  const formattedBalance = useMemo(() => {
    if (balanceHidden) {
      return "••••••••";
    }
    return `${currency.symbol}0.00`;
  }, [balanceHidden, currency.symbol]);

  const balanceSubtitle = "12% From Last Month";

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

  const handleToggleRecentTransactions = () => {
    setShowEmptyTransactions((prev) => !prev);
  };

  return (
    <>
      <MainContainer edges={["top"]} className="bg-light pb-0">
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            <View className="bg-primary_200 pt-4">
              <View className="flex-row items-center justify-between px-6">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-primary_100">
                    <Text
                      weight="semibold"
                      className="text-lg text-primary_400"
                    >
                      N
                    </Text>
                  </View>
                  <View>
                    <Text weight="semibold" className="text-lg">
                      Welcome Niyi! <Text>👋</Text>
                    </Text>
                    <Text weight="medium" className="text-sm text-textColor/60">
                      5 September, 2025
                    </Text>
                  </View>
                </View>
                <Pressable className="h-14 w-14 items-center justify-center rounded-full bg-white">
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={"#000"}
                  />
                </Pressable>
              </View>

              <View className="mt-6 rounded-3xl  px-6 py-6">
                <Text
                  family="nunito"
                  weight="medium"
                  className="text-base  text-textColor/60"
                >
                  Wallet Balance
                </Text>
                <View className="mt-3 flex-row items-center justify-between">
                  <View className="flex-row items-baseline gap-2">
                    <Text weight="bold" className="text-4xl">
                      {formattedBalance}
                    </Text>
                    <Pressable
                      hitSlop={10}
                      onPress={() => setBalanceHidden((prev) => !prev)}
                    >
                      <Ionicons
                        name={balanceHidden ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color={COLORS.tertiary}
                      />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => setShowCurrencySheet(true)}
                    className="flex-row items-center gap-2 rounded-full bg-white px-3 py-2"
                  >
                    <Image
                      source={currency.flag}
                      style={{ width: 20, height: 20, borderRadius: 10 }}
                      contentFit="cover"
                    />
                    <Text weight="semibold" className="text-primary_400">
                      {currency.code}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={COLORS.primary_400}
                    />
                  </Pressable>
                </View>
                <View className="mt-2 flex-row items-center gap-2">
                  <Ionicons
                    name="arrow-up"
                    size={16}
                    color={COLORS.secondary_500}
                  />
                  <Text className="text-xs text-secondary_500">
                    {balanceSubtitle}
                  </Text>
                </View>

                <View className="mt-5 flex-row gap-3">
                  {summaryCards.map((item) => (
                    <View
                      key={item.id}
                      className={cn(
                        "flex-1 flex-row items-center gap-3 rounded-xl bg-white  px-4 py-3",
                      )}
                    >
                      <View
                        className={cn(
                          "h-10 w-10 items-center justify-center",
                          item.accent,
                        )}
                      >
                        <Image
                          source={item.icon}
                          style={{ width: 30, height: 30 }}
                          contentFit="contain"
                        />
                      </View>
                      <View>
                        <Text
                          weight="medium"
                          className="text-base text-textColor/60"
                        >
                          {item.label}
                        </Text>
                        <Text weight="semibold" className="mt-1 text-lg">
                          {item.amount}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View className="bg-lightMuted px-6">
              <View className="mt-4">
                <Text weight="semibold" className="text-lg">
                  Quick Actions
                </Text>
                <View className="mt-4 flex-row gap-3">
                  {quickActions.map((action) => (
                    <Pressable
                      key={action.id}
                      onPress={() => handleQuickActionPress(action)}
                      className={cn(
                        "flex-row items-center gap-2 rounded-full border border-grayLight px-3 py-2 ",
                        action.background,
                        action.aspectRatio === 1 && "aspect-square",
                      )}
                    >
                      <View className="h-8 w-8 items-center justify-center rounded-full">
                        <Image
                          source={action.icon}
                          style={{ aspectRatio: 1, width: "100%" }}
                          contentFit="contain"
                        />
                      </View>
                      {action.label && (
                        <Text className="text-sm text-black" weight="semibold">
                          {action.label}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <ImageBackground style={{marginTop:32, borderRadius:18,padding:14, backgroundColor:COLORS.secondary_200}}  source={require('@/assets/images/home/fold-pattern.png')}>
                <View className="mb-3 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full  bg-white/70">
                    <Ionicons
                      name="bulb"
                      size={24}
                      color={COLORS.secondary_500}
                    />
                  </View>
                  <Text weight="bold" className="text-xl">
                    Financial Tip
                  </Text>
                </View>
                <Text className="text-sm text-textColor/60">
                  Set aside ₦500 daily for emergencies. Small amounts add up to
                  big savings over time!
                </Text>
              </ImageBackground>

              <View className="mt-8 rounded-3xl bg-white px-5 py-5">
                <View className="flex-row items-center justify-between">
                  <Text weight="semibold" className="text-base">
                    Black Market FX
                  </Text>
                  <View className="flex-row items-center gap-2 rounded-full bg-secondary_100 px-3 py-1">
                    <View className="h-2 w-2 rounded-full bg-secondary_500" />
                    <Text className="text-xs text-secondary_500">Live</Text>
                  </View>
                </View>

                <View className="mt-4 rounded-2xl  px-3 py-3">
                  {fxRates.map((rate, index) => {
                    const changeColor =
                      rate.change >= 0 ? COLORS.secondary_500 : "#F87171";
                    return (
                      <View
                        key={rate.id}
                        className={cn(
                          "flex-row items-center justify-between py-3",
                          index !== fxRates.length - 1 &&
                            "border-b border-grayLight",
                        )}
                      >
                        <View className="flex-row items-center gap-3">
                          <View className="relative h-8 w-10">
                            <Image
                              source={rate.flags[0]}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                position: "absolute",
                                left: 0,
                                top: 0,
                                borderWidth: 1,
                                borderColor: "#ffffff",
                              }}
                              contentFit="cover"
                            />
                            <Image
                              source={rate.flags[1]}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                position: "absolute",
                                right: 0,
                                top: 0,
                                borderWidth: 1,
                                borderColor: "#ffffff",
                              }}
                              contentFit="cover"
                            />
                          </View>
                          <View>
                            <Text weight="semibold">{rate.pair}</Text>
                            <Text className="text-xs text-textColor/50">
                              {rate.code}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text weight="semibold" className="text-base">
                            {rate.price}
                            <Text className="text-xs text-textColor/60">
                              {currency.symbol}
                            </Text>
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: changeColor }}
                          >
                            {rate.change > 0 ? "+" : ""}
                            {rate.change.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
              <View className="mt-8">
              <View className="flex-row items-center justify-between">

                <Pressable
                  onPress={handleToggleRecentTransactions}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Text weight="semibold" className="text-lg">
                    Recent Transactions
                  </Text>
                </Pressable>
                <Pressable onPress={()=>router.navigate('/transactions')}>
                  <Text className="text-primary_400" weight="semibold">See all</Text>
                </Pressable>
              </View>
                <View className="mt-4 rounded-xl bg-white px-5 py-5 shadow-sm">
                  {showEmptyTransactions ? (
                    <View className="mt-4 items-center justify-center">
                      <Image
                        source={require("@/assets/images/home/no-recent-trans.svg")}
                        style={{ width: 170, height: 162 }}
                        contentFit="contain"
                      />
                      <Text weight="semibold" className="mt-4 text-base">
                        No recent transactions
                      </Text>
                      <Text className="mt-1 text-center text-xs text-textColor/60">
                        All transactions will appear here
                      </Text>
                    </View>
                  ) : (
                    <View>
                      {recentTransactions.map((transaction, index) => {
                        const amountDisplay = `${transaction.amount >= 0 ? "" : "-"}₦${Math.abs(transaction.amount).toLocaleString("en-NG", {
                          maximumFractionDigits: 0,
                          minimumFractionDigits: 0,
                        })}`;
                        const amountColor =
                          transaction.type === "income"
                            ? COLORS.secondary_500
                            : "#D14343";
                        return (
                          <View
                            key={transaction.id}
                            className={cn(
                              "flex-row items-center py-3",
                              index !== recentTransactions.length - 1 &&
                                "border-b border-grayLight",
                            )}
                          >
                            <View
                              className="mr-4 size-10 items-center justify-center rounded-full"
                              style={{ backgroundColor: transaction.accent }}
                            >
                              <Image
                                source={transaction.icon}
                                style={{ width: 24, height: 24 }}
                                contentFit="contain"
                              />
                            </View>
                            <View className="flex-1">
                              <Text weight="semibold" className="text-sm">
                                {transaction.title}
                              </Text>
                              <Text className="mt-1 text-xs text-textColor/60">
                                {transaction.category}
                              </Text>
                            </View>
                            <View className="items-end">
                              <Text
                                weight="semibold"
                                className="text-sm"
                                style={{ color: amountColor }}
                              >
                                {amountDisplay}
                              </Text>
                              <Text className="mt-1 text-xs text-textColor/50">
                                {transaction.timeAgo}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <SlideUpModal
          visible={showCurrencySheet}
          onClose={() => setShowCurrencySheet(false)}
          title="Currency"
          headerBackgroundColor={COLORS.primary_400}
          headerTextColor="#fff"
          closeIconColor="#fff"
          className="pt-4"
        >
          <View className="gap-3">
            {currencies.map((option) => {
              const isSelected = option.code === currency.code;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => handleCurrencySelect(option)}
                  className="flex-row items-center justify-between rounded-2xl px-4 py-4"
                >
                  <View className="flex-row items-center gap-3">
                    <Image
                      source={option.flag}
                      style={{ width: 28, height: 28, borderRadius: 14 }}
                      contentFit="cover"
                    />
                    <Text>{option.label}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={isSelected ? COLORS.primary_400 : COLORS.grey}
                  />
                </Pressable>
              );
            })}
          </View>
        </SlideUpModal>
      </MainContainer>
    </>
  );
};

export default HomeScreen;
