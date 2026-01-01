import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { RelativePathString, Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View, ViewStyle } from "react-native";

type NotificationTab = "activities" | "transactions";

type ActivityNotification = {
  id: string;
  title: string;
  message: string;
  timeLabel: string;
  dateLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  ctaLabel?: string;
  target?: string;
};

type TransactionType = "income" | "expense";

type TransactionNotification = {
  id: string;
  title: string;
  account: string;
  timeAgo: string;
  amount: number;
  type: TransactionType;
  icon: ImageSource;
  accent: string;
  description?: string;
};

type TransactionSection = {
  id: string;
  title: string;
  items: TransactionNotification[];
};

const activityNotifications: ActivityNotification[] = [];

const transactionSections: TransactionSection[] = [];

const tabs: { id: NotificationTab; label: string }[] = [
  { id: "activities", label: "Activities" },
  { id: "transactions", label: "Transactions" },
];

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatAmountWithSign = (value: number) => {
  if (value === 0) {
    return formatCurrency(0);
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
};

const buildTransactionSections = () => {
  return transactionSections.map((section) => {
    const total = section.items.reduce((sum, item) => sum + item.amount, 0);
    const isPositive = total >= 0;
    return {
      ...section,
      summary: {
        total: Math.abs(total),
        label: isPositive ? "Net Income" : "Net Expense",
        color: isPositive ? COLORS.secondary_500 : "#D14343",
        transactionCount: section.items.length,
      },
    };
  });
};

const NotificationsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotificationTab>("activities");

  const transactionData = useMemo(() => buildTransactionSections(), []);

  const handleTransactionPress = (transactionId: string) => {
    router.push("/transactions/details");
  };

  const handleActivityPress = (activity: ActivityNotification) => {
    if (activity.target) {
      router.push(activity.target as RelativePathString);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Notifications" }} />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <View className="flex-1 px-6 pt-6">
          <View className="flex-row rounded-full bg-grayLight/90 p-1">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const activeStyle: ViewStyle = isActive
                ? {
                    backgroundColor: "#FFFFFF",
                  }
                : {};
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 items-center justify-center rounded-full py-3",
                    isActive ? "bg-white" : "bg-transparent",
                  )}
                  style={activeStyle}
                  accessibilityRole="button"
                >
                  <Text
                    weight="semibold"
                    className={cn(
                      "text-sm",
                      isActive ? "text-textColor" : "text-textColor/60",
                    )}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-6 flex-1">
            {activeTab === "activities" ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
              >
                <View className="gap-4">
                  {activityNotifications.map((activity) => (
                    <View
                      key={activity.id}
                      className="rounded-3xl bg-white px-5 py-5"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 flex-row items-center">
                          <View
                            className="mr-3 size-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: activity.iconBackground }}
                          >
                            <Ionicons
                              name={activity.icon}
                              size={22}
                              color={activity.iconColor}
                            />
                          </View>
                          <Text weight="semibold" className="flex-1 text-base">
                            {activity.title}
                          </Text>
                        </View>
                        {activity.ctaLabel ? (
                          <Pressable
                            onPress={() => handleActivityPress(activity)}
                            className="items-center justify-center rounded-full bg-primary_100 px-4 py-2"
                            accessibilityRole="button"
                          >
                            <Text
                              weight="semibold"
                              className="text-sm text-primary_400"
                            >
                              {activity.ctaLabel}
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>

                      <Text className="mt-3 text-sm text-textColor/70">
                        {activity.message}
                      </Text>

                      <View className="mt-5 flex-row items-center justify-between">
                        <Text className="text-xs text-textColor/60">
                          {activity.timeLabel}
                        </Text>
                        <Text className="text-xs text-textColor/60">
                          {activity.dateLabel}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
              >
                <View className="gap-6">
                  {transactionData.map((section) => (
                    <View
                      key={section.id}
                      className="rounded-2xl border border-grayLight/70 bg-white"
                    >
                      <View className="flex-row items-end justify-between border-b border-grayLight/80 px-5 py-4">
                        <View>
                          <Text
                            weight="semibold"
                            className="text-base text-textColor"
                          >
                            {section.title}
                          </Text>
                          <Text className="text-xs text-textColor/60">
                            {section.summary.transactionCount}{" "}
                            {section.summary.transactionCount === 1
                              ? "transaction"
                              : "transactions"}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text
                            weight="semibold"
                            className="text-base"
                            style={{ color: section.summary.color }}
                          >
                            {formatCurrency(section.summary.total)}
                          </Text>
                          <Text className="text-xs text-textColor/60">
                            {section.summary.label}
                          </Text>
                        </View>
                      </View>

                      <View className="gap-3 px-4 py-4">
                        {section.items.map((item) => (
                          <Pressable
                            key={item.id}
                            onPress={() => handleTransactionPress(item.id)}
                            className="flex-row items-center rounded-3xl bg-white px-4 py-4"
                            accessibilityRole="button"
                          >
                            <View
                              className="mr-3 size-12 items-center justify-center rounded-full"
                              style={{ backgroundColor: item.accent }}
                            >
                              <Image
                                source={item.icon}
                                style={{ width: 26, height: 26 }}
                                contentFit="contain"
                              />
                            </View>
                            <View className="flex-1 pe-2">
                              <Text
                                weight="semibold"
                                numberOfLines={1}
                                className="text-base text-textColor"
                              >
                                {item.title}
                              </Text>
                              <Text className="mt-1 text-xs text-textColor/60">
                                {item.account} • {item.timeAgo}
                              </Text>
                              {item.description ? (
                                <Text
                                  italic
                                  className="mt-1 text-xs text-textColor/60"
                                >
                                  {item.description}
                                </Text>
                              ) : null}
                            </View>
                            <View className="items-end">
                              <Text
                                weight="semibold"
                                className={cn(
                                  "text-sm",
                                  item.type === "income"
                                    ? "text-secondary_500"
                                    : "text-[#D14343]",
                                )}
                              >
                                {formatAmountWithSign(item.amount)}
                              </Text>
                              <Text className="mt-1 text-xs text-textColor/40">
                                {item.type === "income" ? "Income" : "Expense"}
                              </Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </MainContainer>
    </>
  );
};

export default NotificationsScreen;
