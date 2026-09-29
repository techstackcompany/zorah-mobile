import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { MOCK_DEBTS } from "@/features/debts/mockData";
import { formatAmountValue } from "@/lib/amount";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Share, View } from "react-native";
import Toast from "react-native-toast-message";
import { DebtStatusBadge } from "@/components/debts/DebtStatusBadge";
import { DebtRecord, DebtStatus } from "@/features/debts/types";

function toRawString(amount: number): string {
  return amount.toFixed(2);
}

const DebtDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const initialDebt = MOCK_DEBTS.find((d) => d.id === id) ?? null;
  const [localStatus, setLocalStatus] = useState<DebtStatus | null>(null);

  if (!initialDebt) {
    return (
      <MainContainer edges={["bottom"]} className="bg-[#F8F9FA]">
        <View className="flex-1 items-center justify-center px-8">
          <Text family="nunito" weight="bold" className="text-base text-textColor">
            Debt not found
          </Text>
        </View>
      </MainContainer>
    );
  }

  const debt: DebtRecord = {
    ...initialDebt,
    status: localStatus ?? initialDebt.status,
  };

  const isBorrowed = debt.direction === "borrowed";
  const initial = debt.counterpartyName.charAt(0).toUpperCase();

  const headerBg = isBorrowed ? "bg-secondary_100" : "bg-peachTint";
  const directionColor = isBorrowed ? "text-secondary_500" : "text-coral";

  const handleMarkAsPaid = () => {
    // TODO: wire to API
    setLocalStatus("settled");
    Toast.show({
      type: "success",
      text1: "Marked as Paid",
      text2: `${debt.counterpartyName}'s debt is now settled.`,
    });
  };

  const handleSendReminder = () => {
    // TODO: wire to API
    Toast.show({
      type: "success",
      text1: "Reminder Sent",
      text2: `Reminder sent to ${debt.counterpartyName}`,
    });
  };

  const handleShare = async () => {
    const dir = isBorrowed ? "borrowed from" : "lent to";
    const msg =
      `Debt Details\n` +
      `I ${dir} ${debt.counterpartyName}\n` +
      `Amount: ₦${debt.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}\n` +
      `Date: ${debt.date}\n` +
      `Due Date: ${debt.dueDate}\n` +
      `Status: ${debt.status}`;
    await Share.share({ message: msg });
  };

  return (
    <MainContainer edges={["bottom"]} className="bg-[#F8F9FA]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Direction header card */}
        <View className={cn("mx-4 mt-4 rounded-2xl px-4 py-4", headerBg)}>
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={isBorrowed ? "arrow-down" : "arrow-up"}
                size={14}
                color={isBorrowed ? COLORS.secondary_500 : COLORS.coral}
              />
              <Text
                family="nunito"
                weight="semibold"
                className={cn("text-xs", directionColor)}
              >
                {isBorrowed ? "You Borrowed" : "You Lent"}
              </Text>
            </View>
            <DebtStatusBadge status={debt.status} />
          </View>
          <Text family="nunito" weight="bold" className="text-3xl text-textColor">
            {formatAmountValue(toRawString(debt.amount), {
              currencySymbol: "₦",
              forceFixedDecimals: true,
            })}
          </Text>
        </View>

        <View className="mx-4 mt-4 rounded-2xl bg-white px-4 py-4">
          {/* Counterparty */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-primary_200">
              <Text
                family="nunito"
                weight="bold"
                className="text-lg text-primary_400"
              >
                {initial}
              </Text>
            </View>
            <View>
              <Text
                family="nunito"
                weight="bold"
                className="text-sm text-textColor"
              >
                {debt.counterpartyName}
              </Text>
              <Text
                family="nunito"
                weight="regular"
                className="text-xs text-textColor/50"
              >
                {debt.counterpartyPhone}
              </Text>
            </View>
          </View>

          {/* Date row */}
          <View className="mb-3 flex-row items-center justify-between border-b border-gray-100 pb-3">
            <Text
              family="nunito"
              weight="medium"
              className="text-sm text-textColor/60"
            >
              Date
            </Text>
            <Text
              family="nunito"
              weight="semibold"
              className="text-sm text-textColor"
            >
              {debt.date.replace(/\//g, " ")}
            </Text>
          </View>

          {/* Due Date row */}
          <View className="mb-3 flex-row items-center justify-between border-b border-gray-100 pb-3">
            <Text
              family="nunito"
              weight="medium"
              className="text-sm text-textColor/60"
            >
              Due Date
            </Text>
            <Text
              family="nunito"
              weight="semibold"
              className="text-sm text-textColor"
            >
              {debt.dueDate.replace(/\//g, " ")}
            </Text>
          </View>

          {/* Notes */}
          {debt.notes && (
            <View className="mb-2">
              <Text
                family="nunito"
                weight="semibold"
                className="mb-2 text-sm text-textColor"
              >
                Notes
              </Text>
              <View className="rounded-xl bg-[#F5F5F5] px-4 py-3">
                <Text
                  family="nunito"
                  weight="regular"
                  className="text-sm text-textColor/70"
                >
                  {debt.notes}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View className="mx-4 mt-4">
          <View className="mb-3 flex-row gap-3">
            <Pressable
              onPress={handleMarkAsPaid}
              className="flex-1 items-center justify-center rounded-xl bg-secondary_200 py-3.5 active:opacity-80"
            >
              <Text
                family="nunito"
                weight="semibold"
                className="text-sm text-secondary_500"
              >
                Mark as Paid
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSendReminder}
              className="flex-1 items-center justify-center rounded-xl border border-primary_400 bg-primary_100 py-3.5 active:opacity-80"
            >
              <Text
                family="nunito"
                weight="semibold"
                className="text-sm text-primary_400"
              >
                Send Reminder
              </Text>
            </Pressable>
          </View>

          {/* Share */}
          <Pressable
            onPress={handleShare}
            className="flex-row items-center justify-center gap-2 py-3 active:opacity-70"
          >
            <Ionicons name="share-social-outline" size={18} color="#9CA3AF" />
            <Text
              family="nunito"
              weight="semibold"
              className="text-sm text-textColor/50"
            >
              Share Details
            </Text>
          </Pressable>
        </View>

        <View className="h-8" />
      </ScrollView>
    </MainContainer>
  );
};

export default DebtDetailsScreen;
