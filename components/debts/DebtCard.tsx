import Text from "@/components/ui/Text";
import { DebtRecord } from "@/features/debts/types";
import { formatAmountValue } from "@/lib/amount";
import { cn } from "@/lib/utils";
import React from "react";
import { Pressable, View } from "react-native";
import { DebtStatusBadge } from "./DebtStatusBadge";

type Props = {
  debt: DebtRecord;
  onPress: (debt: DebtRecord) => void;
  onSendReminder: (debt: DebtRecord) => void;
};

function toRawString(amount: number): string {
  return amount.toFixed(2);
}

export const DebtCard = ({ debt, onPress, onSendReminder }: Props) => {
  const isSettled = debt.status === "settled";
  const isOverdue = debt.status === "overdue";
  const isBorrowed = debt.direction === "borrowed";

  const reminderBorderColor = isSettled
    ? "border-gray-300"
    : isOverdue
      ? "border-coral"
      : "border-primary_400";

  const reminderTextColor = isSettled
    ? "text-gray-400"
    : isOverdue
      ? "text-coral"
      : "text-primary_400";

  const reminderBg = isOverdue ? "bg-peachTint" : "bg-primary_100";

  return (
    <Pressable
      onPress={() => onPress(debt)}
      className="mb-0 border-b border-gray-100 bg-white px-4 py-4 active:bg-gray-50"
      accessibilityRole="button"
    >
      {/* Top row: name + badge */}
      <View className="mb-1 flex-row items-center justify-between">
        <Text
          family="nunito"
          weight="semibold"
          className="text-base text-textColor"
        >
          {debt.counterpartyName}
        </Text>
        <DebtStatusBadge status={debt.status} />
      </View>

      {/* Direction label */}
      <Text
        family="nunito"
        weight="semibold"
        className={cn(
          "mb-2 text-xs",
          isBorrowed ? "text-secondary_500" : "text-coral",
        )}
      >
        {isBorrowed ? "You borrowed" : "You lent"}
      </Text>

      {/* Amount row + reminder button */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text
            family="nunito"
            weight="bold"
            className="text-lg text-textColor"
          >
            {formatAmountValue(toRawString(debt.amount), {
              currencySymbol: "₦",
              forceFixedDecimals: true,
            })}
          </Text>
          <Text
            family="nunito"
            weight="regular"
            className="text-xs text-textColor/50"
          >
            Due: {debt.dueDate}
          </Text>
        </View>

        <Pressable
          onPress={() => !isSettled && onSendReminder(debt)}
          disabled={isSettled}
          className={cn(
            "rounded-lg border px-4 py-2",
            reminderBorderColor,
            reminderBg,
          )}
        >
          <Text
            family="nunito"
            weight="semibold"
            className={cn("text-xs", reminderTextColor)}
          >
            Send Reminder
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};
