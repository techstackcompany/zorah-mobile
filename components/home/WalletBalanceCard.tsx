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
    <View className="mt-6 rounded-3xl px-6 py-6">
      <Text
        family="nunito"
        weight="medium"
        className="text-base text-textColor/60"
      >
        Wallet Balance
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Pressable
            className="flex-row items-baseline gap-2"
            hitSlop={10}
            onPress={onToggleBalanceVisibility}
          >
            <Text weight="bold" className="text-3xl">
              {formattedBalance}
            </Text>
            <Ionicons
              name={balanceHidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.tertiary}
            />
          </Pressable>
        </View>
      </View>
      {balanceSubtitle ? (
        <View className="mt-2 flex-row items-center gap-2">
          <Ionicons name="arrow-up" size={16} color={COLORS.secondary_500} />
          <Text className="text-xs text-secondary_500">{balanceSubtitle}</Text>
        </View>
      ) : null}

      <View className="mt-5 flex-row gap-3">
        {summaryCards.map((item) => (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            className={cn(
              "flex-1 flex-row items-center gap-3 rounded-xl bg-white px-4 py-3",
            )}
          >
            <View
              className={cn("h-9 w-9 items-center justify-center", item.accent)}
            >
              <Image
                source={item.icon}
                style={{ width: 28, height: 28 }}
                contentFit="contain"
              />
            </View>
            <View>
              <Text weight="medium" className="text-sm text-textColor/60">
                {item.label}
              </Text>
              <Text weight="semibold" className="mt-1 text-base">
                {item.amount}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default WalletBalanceCard;
