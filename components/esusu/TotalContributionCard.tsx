import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type Trend = "up" | "down" | "neutral";

type TotalContributionCardProps = {
  totalAmount: string;
  activeGroups: number;
  trend?: Trend;
  trendPercentage?: number;
};

export default function TotalContributionCard({
  totalAmount,
  activeGroups,
  trend = "neutral",
  trendPercentage = 0,
}: TotalContributionCardProps) {
  return (
    <View className="mt-8 flex-row items-center justify-between rounded-[24px] bg-white px-5 py-6">
      <View>
        <Text className="text-base text-textColor/60">Total Contribution</Text>
        <Text className="text-4xl text-textColor" weight="bold">
          {totalAmount}
        </Text>
      </View>
      <View className="items-end">
        <View className="mb-2">
          <Text className="text-sm text-textColor/60">
            Active Group: <Text weight="bold">{activeGroups}</Text>
          </Text>
        </View>
        <View
          className={cn(
            "items-end rounded-sm px-2.5 py-1",
            trend === "up"
              ? "bg-[#E9FFF1]"
              : trend === "down"
                ? "bg-[#FFE9E9]"
                : "bg-secondary_100",
          )}
        >
          <View className="flex-row items-center gap-1">
            {trend === "up" && (
              <Ionicons name="arrow-up" size={12} color="#1F8D44" />
            )}
            {trend === "down" && (
              <Ionicons name="arrow-down" size={12} color="#DC2626" />
            )}
            {trend === "neutral" && (
              <Ionicons name="remove" size={12} color="#6B7280" />
            )}
            <Text
              className={cn(
                "text-sm font-semibold",
                trend === "up"
                  ? "text-[#1F8D44]"
                  : trend === "down"
                    ? "text-[#DC2626]"
                    : "text-[#6B7280]",
              )}
              weight="semibold"
            >
              {trendPercentage !== 0 ? `${Math.abs(trendPercentage)}%` : "0%"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
