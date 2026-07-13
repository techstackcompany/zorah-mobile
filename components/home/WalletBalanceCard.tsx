import { ScalePressable } from "@/components/ui/ScalePressable";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { SummaryCard } from "@/constants/home";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

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
  // Crossfade the balance: fade out, swap the displayed text, fade back in.
  const [displayedBalance, setDisplayedBalance] = useState(formattedBalance);
  const balanceOpacity = useSharedValue(1);

  useEffect(() => {
    if (formattedBalance === displayedBalance) return;
    balanceOpacity.value = withTiming(
      0,
      { duration: 110, easing: Easing.in(Easing.ease) },
      (finished) => {
        if (finished) {
          runOnJS(setDisplayedBalance)(formattedBalance);
        }
      },
    );
  }, [formattedBalance, displayedBalance, balanceOpacity]);

  useEffect(() => {
    balanceOpacity.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.ease),
    });
  }, [displayedBalance, balanceOpacity]);

  const balanceStyle = useAnimatedStyle(() => ({
    opacity: balanceOpacity.value,
    transform: [{ translateY: (1 - balanceOpacity.value) * 3 }],
  }));

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
          {/* fontFamily must match Text's family="nunito" weight="bold" mapping */}
          <Animated.Text
            style={[{ fontFamily: "NunitoBold" }, balanceStyle]}
            className="text-4xl text-textColor"
          >
            {displayedBalance}
          </Animated.Text>
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
            {displayedBalance}
          </Text>
        </View>
      </View>

      {/* Expense / Income summary cards */}
      <View className="mt-5 flex-row gap-3">
        {summaryCards.map((item) => (
          <ScalePressable
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
          </ScalePressable>
        ))}
      </View>
    </View>
  );
};

export default WalletBalanceCard;
