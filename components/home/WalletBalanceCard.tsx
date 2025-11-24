import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";

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

type WalletBalanceCardProps = {
  formattedBalance: string;
  balanceHidden: boolean;
  currency: CurrencyOption;
  balanceSubtitle: string;
  summaryCards: SummaryCard[];
  onToggleBalanceVisibility: () => void;
  onCurrencyPress: () => void;
};

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  formattedBalance,
  balanceHidden,
  currency,
  balanceSubtitle,
  summaryCards,
  onToggleBalanceVisibility,
  onCurrencyPress,
}) => {
  return (
    <View className="mt-6 rounded-3xl px-6 py-6">
      <Text
        family="nunito"
        weight="medium"
        className="text-base text-textColor/60"
      >
        Wallet Balance
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-baseline gap-2">
          <Text weight="bold" className="text-3xl">
            {formattedBalance}
          </Text>
          <Pressable hitSlop={10} onPress={onToggleBalanceVisibility}>
            <Ionicons
              name={balanceHidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.tertiary}
            />
          </Pressable>
        </View>
        <Pressable
          onPress={onCurrencyPress}
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
          <Ionicons name="chevron-down" size={16} color={COLORS.primary_400} />
        </Pressable>
      </View>
      <View className="mt-2 flex-row items-center gap-2">
        <Ionicons name="arrow-up" size={16} color={COLORS.secondary_500} />
        <Text className="text-xs text-secondary_500">{balanceSubtitle}</Text>
      </View>

      <View className="mt-5 flex-row gap-3">
        {summaryCards.map((item) => (
          <View
            key={item.id}
            className={cn(
              "flex-1 flex-row items-center gap-3 rounded-xl bg-white px-4 py-3",
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
              <Text weight="medium" className="text-base text-textColor/60">
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
  );
};

export default WalletBalanceCard;
