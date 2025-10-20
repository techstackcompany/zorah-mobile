import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

type CurrencyOption = {
  code: string;
  label: string;
  symbol: string;
  flag: string;
};

type SummaryCard = {
  id: string;
  label: string;
  amount: string;
  icon: "arrow-down" | "arrow-up";
  iconColor: string;
  accent: string;
};

type QuickAction = {
  id: string;
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
};

type FxRate = {
  id: string;
  pair: string;
  code: string;
  change: number;
  price: string;
  flag: string;
};

type BottomNavItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
};

const currencies: CurrencyOption[] = [
  {
    code: "NGN",
    label: "NGN - Nigerian (Naira)",
    symbol: "₦",
    flag: "🇳🇬",
  },
  {
    code: "CAD",
    label: "CAD - Canadian (Dollar)",
    symbol: "$",
    flag: "🇨🇦",
  },
  {
    code: "GHS",
    label: "GHS - Ghanaian (Cedi)",
    symbol: "₵",
    flag: "🇬🇭",
  },
];

const summaryCards: SummaryCard[] = [
  {
    id: "expense",
    label: "Expense",
    amount: "₦0.00",
    icon: "arrow-down",
    iconColor: "#FC9E4F",
    accent: "bg-[#FFF3E9]",
  },
  {
    id: "income",
    label: "Income",
    amount: "₦0.00",
    icon: "arrow-up",
    iconColor: "#32A34D",
    accent: "bg-secondary_100",
  },
];

const quickActions: QuickAction[] = [
  {
    id: "expense-income",
    label: "Expense & Income",
    icon: "add-circle",
    background: "bg-white",
    iconColor: COLORS.primary_400,
  },
  {
    id: "goals",
    label: "Set Goals",
    icon: "flag",
    background: "bg-white",
    iconColor: COLORS.secondary_500,
  },
  {
    id: "more",
    icon: "ellipsis-horizontal",
    background: "bg-white",
    iconColor: COLORS.tertiary,
  },
];

const fxRates: FxRate[] = [
  {
    id: "cadngn",
    pair: "CAD/NGN",
    code: "CADNGN",
    change: 2.5,
    price: "1,650.10",
    flag: "🇨🇦",
  },
  {
    id: "usdcad",
    pair: "USD/CAD",
    code: "USDCAD",
    change: -0.2,
    price: "1.38314",
    flag: "🇺🇸",
  },
  {
    id: "audngn",
    pair: "AUD/NGN",
    code: "AUDNGN",
    change: -0.2,
    price: "1.38314",
    flag: "🇦🇺",
  },
];

const bottomNavItems: BottomNavItem[] = [
  { id: "home", label: "Home", icon: "home", active: true },
  { id: "history", label: "History", icon: "time-outline" },
  { id: "portfolio", label: "Briefcase", icon: "briefcase-outline" },
  { id: "analytics", label: "Analytics", icon: "stats-chart" },
  { id: "profile", label: "Profile", icon: "person-circle-outline" },
];

const cardShadow: StyleProp<ViewStyle> = {
  shadowColor: "#1F2937",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
};

const HomeScreen = () => {
  const [currency, setCurrency] = useState<CurrencyOption>(currencies[0]);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);

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

  return (
    <MainContainer className="bg-light">
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View className="bg-primary_200 pt-4">
            <View className="flex-row items-center justify-between px-6">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary_100">
                  <Text weight="semibold" className="text-lg text-primary_400">
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
                    className={cn("flex-1  px-3 py-4 flex-row items-center bg-white rounded-3xl gap-3", )}
                  >
                    <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-white/80">
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.iconColor}
                      />
                    </View>
                    <Text className="text-sm text-textColor/60">
                      {item.label}
                    </Text>
                    <Text weight="semibold" className="mt-1 text-lg">
                      {item.amount}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View className="px-6 bg-lightMuted">
            <View className="mt-4">
              <Text weight="semibold" className="text-base">
                Quick Actions
              </Text>
              <View className="mt-4 flex-row gap-3">
                {quickActions.map((action) => (
                  <Pressable
                    key={action.id}
                    className={cn(
                      " flex-row items-center gap-3 rounded-full px-4 py-2",
                      action.background,
                    )}
                  >
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary_100">
                      <Ionicons
                        name={action.icon}
                        size={22}
                        color={action.iconColor}
                      />
                    </View>
                    {action.label &&<Text className="text-sm">{action.label}</Text>}
                  </Pressable>
                ))}
              </View>
            </View>

            <View
              className="mt-8 rounded-3xl bg-secondary_100 px-5 py-5"
            >
              <View className="mb-3 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
                  <Ionicons
                    name="bulb"
                    size={20}
                    color={COLORS.secondary_500}
                  />
                </View>
                <Text
                  weight="semibold"
                  className="text-base text-secondary_500"
                >
                  Financial Tip
                </Text>
              </View>
              <Text className="text-sm text-textColor/80">
                Set aside ₦500 daily for emergencies. Small amounts add up to
                big savings over time!
              </Text>
            </View>

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
                        <Text className="text-2xl">{rate.flag}</Text>
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

            <View className="mt-8 rounded-xl bg-white px-5 py-5 shadow-sm">
              <Text weight="semibold" className="text-base">
                Recent Transactions
              </Text>
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
            </View>
          </View>
        </ScrollView>

        <View className="pb-3">
          <View className="rounded-full bg-primary_400 px-2 py-2">
            <View className="flex-row items-center justify-between">
              {bottomNavItems.map((item) => {
                const isActive = !!item.active;
                return (
                  <Pressable
                    key={item.id}
                    className={cn(
                      "flex-1 items-center justify-center py-2",
                      isActive &&
                        "mx-1 flex-row gap-2 rounded-full bg-white px-3",
                    )}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isActive ? COLORS.primary_400 : "#FFFFFF"}
                    />
                    {isActive ? (
                      <Text
                        weight="semibold"
                        className="text-sm text-primary_400"
                      >
                        {item.label}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
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
                className="flex-row items-center justify-between rounded-2xl   px-4 py-4"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">{option.flag}</Text>
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
  );
};

export default HomeScreen;
