import { ScalePressable } from "@/components/ui/ScalePressable";
import Text from "@/components/ui/Text";
import { EsusuGroup, EsusuStatus } from "@/features/esusu/types";
import { cn, formatCurrencyWithSymbol } from "@/lib/utils";
import React from "react";
import { View } from "react-native";

interface EsusuGroupCardProps {
  group: EsusuGroup;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<
  EsusuStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  active: {
    label: "Active",
    bgClass: "bg-secondary_100",
    textClass: "text-secondary_500",
  },
  pending: {
    label: "Pending",
    bgClass: "bg-[#FFF7ED]",
    textClass: "text-[#EA580C]",
  },
  completed: {
    label: "Completed",
    bgClass: "bg-primary_200",
    textClass: "text-primary_400",
  },
};

export const EsusuGroupCard = ({ group, onPress }: EsusuGroupCardProps) => {
  const statusMeta = STATUS_CONFIG[group.status] ?? STATUS_CONFIG.active;
  const formattedContribution = formatCurrencyWithSymbol(
    group.contributionAmount,
    "₦ ",
  );
  const progressPercent = Math.min(
    100,
    Math.round((group.memberCount / group.totalMembers) * 100),
  );

  const handlePress = () => {
    // TODO: wire to API
    onPress?.();
  };

  return (
    <ScalePressable
      scaleTo={0.98}
      onPress={handlePress}
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      accessibilityRole="button"
      accessibilityLabel={`${group.name} group card`}
    >
      <View className="flex-row items-center justify-between">
        <Text family="nunito" weight="bold" className="flex-1 text-base text-textColor">
          {group.name}
        </Text>
        <View className={cn("rounded-full px-2.5 py-0.5", statusMeta.bgClass)}>
          <Text family="nunito" weight="semibold" className={cn("text-xs", statusMeta.textClass)}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      <View className="mt-2 flex-row items-baseline justify-between">
        <Text family="degular" weight="bold" className="text-lg text-textColor">
          {formattedContribution}{" "}
          <Text family="nunito" weight="regular" className="text-xs text-textColor/60">
            / {group.frequency}
          </Text>
        </Text>
        <Text family="nunito" weight="regular" className="text-xs text-textColor/70">
          {group.memberCount} of {group.totalMembers} members
        </Text>
      </View>

      <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <View
          style={{ width: `${progressPercent}%` }}
          className={cn(
            "h-full rounded-full",
            group.status === "completed" ? "bg-secondary_500" : "bg-primary_400",
          )}
        />
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-gray-50 pt-2">
        <Text family="nunito" weight="regular" className="text-xs text-textColor/60">
          Next payout: {group.nextContributionDate}
        </Text>
        {group.payoutOrder ? (
          <Text family="nunito" weight="medium" className="text-xs text-primary_400">
            Position #{group.payoutOrder}
          </Text>
        ) : null}
      </View>
    </ScalePressable>
  );
};
