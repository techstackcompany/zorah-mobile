import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { SummaryCard } from "@/screens/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";

type WalletBalanceCardProps = {
  formattedBalance: string;
  balanceHidden: boolean;
  balanceSubtitle: string | null;
  summaryCards: SummaryCard[];
  onToggleBalanceVisibility: () => void;
};

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  formattedBalance,
  balanceHidden,
  balanceSubtitle,
  summaryCards,
  onToggleBalanceVisibility,
}) => {
  return (
    <View className="mt-6 px-6 py-6">
      {/* Total Balance */}
      <View className="items-center">
        <Text
          family="nunito"
          weight="medium"
          className="text-sm text-textColor/50"
        >
          Total Balance
        </Text>
        <Pressable
          className="mt-2 flex-row items-baseline gap-2"
          hitSlop={10}
          onPress={onToggleBalanceVisibility}
        >
          <Text weight="bold" className="text-4xl">
            {formattedBalance}
          </Text>
          <Ionicons
            name={balanceHidden ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.tertiary}
          />
        </Pressable>
        {balanceSubtitle ? (
          <View className="mt-2 flex-row items-center gap-1">
            <Ionicons name="arrow-up" size={14} color={COLORS.secondary_500} />
            <Text className="text-xs text-secondary_500">
              {balanceSubtitle}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Account breakdown */}
      <View className="mt-5 rounded-2xl bg-white/30 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text weight="bold" className="text-sm text-textColor/70">
              Wallet Balance
            </Text>
          </View>
          <Text weight="semibold" className="text-sm">
            {formattedBalance}
          </Text>
        </View>
      </View>

      {/* Expense / Income summary cards */}
      <View className="mt-5 flex-row gap-3">
        {summaryCards.map((item) => (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            className={cn("flex-1 rounded-2xl bg-white px-4 py-4")}
          >
            <View
              className={cn(
                "h-9 w-9 items-center justify-center rounded-xl",
                item.accent,
              )}
            >
              <Image
                source={item.icon}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </View>
            <Text
              weight="medium"
              className="mt-3 text-xs text-textColor/50"
              numberOfLines={1}
            >
              {item.label}
            </Text>
            <Text
              weight="bold"
              className="mt-0.5 text-base text-textColor"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {item.amount}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default WalletBalanceCard;
