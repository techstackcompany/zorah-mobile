import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { CATEGORY_ICON_MAP } from "@/features/expense-income/utils";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

type RecentTransactionItem = {
  id: string;
  title: string;
  category: string;
  amount: number;
  timeAgo: string;
  type: "income" | "expense";
};

type RecentTransactionsProps = {
  transactions: RecentTransactionItem[];
  showEmpty: boolean;
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  showEmpty,
}) => {
  const router = useRouter();

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between">
        <Text>
          <Text weight="semibold" className="text-lg">
            Recent Transactions
          </Text>
        </Text>
        <Pressable onPress={() => router.navigate("/transactions")}>
          <Text className="text-primary_400" weight="semibold">
            See all
          </Text>
        </Pressable>
      </View>
      <View className="mt-4 rounded-xl bg-white px-5 py-5 shadow-sm">
        {showEmpty ? (
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
              Recent transactions will appear here
            </Text>
          </View>
        ) : (
          <View>
            {transactions.map((transaction, index) => {
              const amountDisplay = `${
                transaction.amount >= 0 ? "" : "-"
              }₦${Math.abs(transaction.amount).toLocaleString("en-NG", {
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              })}`;
              const amountColor =
                transaction.type === "income"
                  ? COLORS.secondary_500
                  : "#D14343";

              // Get icon for category
              const categoryIcon =
                CATEGORY_ICON_MAP[transaction.category] || "wallet-outline";
              const iconBgColor =
                transaction.type === "income" ? "#E5F6F0" : "#FFF1DD";

              return (
                <View
                  key={transaction.id}
                  className={cn(
                    "flex-row items-center py-3",
                    index !== transactions.length - 1 &&
                      "border-b border-grayLight",
                  )}
                >
                  <View
                    className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: iconBgColor }}
                  >
                    <Ionicons
                      name={categoryIcon}
                      size={20}
                      color={amountColor}
                    />
                  </View>

                  <View className="flex-1">
                    <Text weight="semibold" className="text-sm capitalize" numberOfLines={1}>
                      {transaction.title}
                    </Text>
                    <Text className="mt-1 text-xs text-textColor/60">
                      {transaction.category}
                    </Text>
                  </View>
                  <View className="items-end ms-5">
                    <Text
                      weight="semibold"
                      className="text-sm"
                      style={{ color: amountColor }}
                    >
                      {amountDisplay}
                    </Text>
                    <Text className="mt-1 text-xs text-textColor/50">
                      {transaction.timeAgo}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

export default RecentTransactions;
