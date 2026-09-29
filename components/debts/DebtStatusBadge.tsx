import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { DebtStatus } from "@/features/debts/types";
import React from "react";
import { View } from "react-native";

type Props = {
  status: DebtStatus;
};

const STATUS_CONFIG: Record<
  DebtStatus,
  { label: string; bg: string; text: string }
> = {
  outstanding: {
    label: "Outstanding",
    bg: "bg-[#FFF8E1]",
    text: "text-amber",
  },
  overdue: {
    label: "Overdue",
    bg: "bg-peachTint",
    text: "text-coral",
  },
  settled: {
    label: "Settled",
    bg: "bg-secondary_100",
    text: "text-secondary_500",
  },
};

export const DebtStatusBadge = ({ status }: Props) => {
  const config = STATUS_CONFIG[status];
  return (
    <View className={cn("rounded-full px-2.5 py-0.5", config.bg)}>
      <Text
        family="nunito"
        weight="semibold"
        className={cn("text-xs", config.text)}
      >
        {config.label}
      </Text>
    </View>
  );
};
