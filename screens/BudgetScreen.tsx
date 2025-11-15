import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useGetBudgetsQuery } from "@/src/api/hooks";
import { Budget } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground, ImageSource } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type BudgetCategory = {
  id: string;
  label: string;
  icon: ImageSource;
  allocated: number;
  spent: number;
  remaining?: number;
  status: "on-track" | "approaching" | "exceeded";
  dueDate: string;
};

const statusMeta: Record<
  BudgetCategory["status"],
  { label: string; badgeBg: string; textColor: string; accentColor: string }
> = {
  "on-track": {
    label: "On Track",
    badgeBg: "#E6F5F3",
    textColor: "#2FA89A",
    accentColor: "#2FA89A",
  },
  exceeded: {
    label: "Budget Exceeded",
    badgeBg: "#FDE8E8",
    textColor: "#D14343",
    accentColor: "#D14343",
  },
  approaching: {
    label: "Approaching Limit",
    badgeBg: "#FFF7E6",
    textColor: "#E9781A",
    accentColor: "#E9781A",
  },
};

const formatCurrency = (value: number) =>
  `₦${value.toLocaleString("en-NG", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;

// Map API category names to UI icons
const CATEGORY_ICON_MAP: Record<string, ImageSource> = {
  Food: require("@/assets/images/home/food.png"),
  Entertainment: require("@/assets/images/home/call.png"),
  Transport: require("@/assets/images/home/transport.png"),
  Shopping: require("@/assets/images/home/shopping.png"),
  Healthcare: require("@/assets/images/home/transport.png"),
  Others: require("@/assets/images/home/bonus.png"),
};

// Format date from ISO string to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Determine budget status based on spent vs allocated
const getBudgetStatus = (
  spent: number,
  allocated: number,
): "on-track" | "approaching" | "exceeded" => {
  if (spent > allocated) return "exceeded";
  const percentage = (spent / allocated) * 100;
  if (percentage >= 80) return "approaching";
  return "on-track";
};

const PROGRESS_SIZE = 200;
const PROGRESS_STROKE_WIDTH = 12;
const PROGRESS_RADIUS = (PROGRESS_SIZE - PROGRESS_STROKE_WIDTH) / 2;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

const BudgetScreen = () => {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BudgetCategory | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch budgets from API
  const {
    data: budgetsData,
    isLoading: isLoadingBudgets,
    refetch: refetchBudgets,
  } = useGetBudgetsQuery();

  // Console logs for debugging
  React.useEffect(() => {
    console.log("=== GET BUDGETS QUERY ===");
    console.log("Full response:", JSON.stringify(budgetsData, null, 2));
    console.log("Is loading:", isLoadingBudgets);
    console.log("========================\n");
  }, [budgetsData, isLoadingBudgets]);

  // Transform API budgets to UI format
  const budgetCategories = useMemo(() => {
    // Handle both wrapped (ApiEnvelope) and direct array responses
    const budgetsArray = Array.isArray(budgetsData)
      ? budgetsData
      : (budgetsData as any)?.data || [];

    if (!Array.isArray(budgetsArray) || budgetsArray.length === 0) {
      return [];
    }

    return budgetsArray.map((budget: any, index: number) => {
      // API uses "totalSpent" and "Limit" (capital L)
      const spent = budget.totalSpent || budget.spent || 0;
      const allocated = budget.Limit || budget.amount || 0;
      const remaining =
        budget.remaining !== undefined
          ? budget.remaining
          : Math.max(allocated - spent, 0);

      // Use API status if available, otherwise calculate
      let status: "on-track" | "approaching" | "exceeded";
      if (budget.status) {
        // Parse API status string like "On track ✅" or "over budget 🚨"
        const statusLower = budget.status.toLowerCase();
        if (
          statusLower.includes("exceeded") ||
          statusLower.includes("over budget") ||
          statusLower.includes("over")
        ) {
          status = "exceeded";
        } else if (
          statusLower.includes("approaching") ||
          statusLower.includes("warning")
        ) {
          status = "approaching";
        } else {
          status = "on-track";
        }
      } else {
        status = getBudgetStatus(spent, allocated);
      }

      return {
        id: `${budget.category || "unknown"}-${index}`,
        label: budget.category || "Unknown",
        icon:
          CATEGORY_ICON_MAP[budget.category] ||
          require("@/assets/images/home/bonus.png"),
        allocated,
        spent,
        remaining,
        status,
        dueDate: budget.endDate ? formatDate(budget.endDate) : "",
      };
    });
  }, [budgetsData]);

  // Calculate totals from budgets
  const { totalBudget, totalSpent } = useMemo(() => {
    const budgetsArray = Array.isArray(budgetsData)
      ? budgetsData
      : (budgetsData as any)?.data || [];

    if (!Array.isArray(budgetsArray)) {
      return { totalBudget: 0, totalSpent: 0 };
    }

    // API uses "Limit" (capital L) and "totalSpent"
    const total = budgetsArray.reduce(
      (sum, budget: Budget) => sum + (budget.Limit || budget.amount || 0),
      0,
    );
    const spent = budgetsArray.reduce(
      (sum, budget: Budget) => sum + (budget.totalSpent || budget.spent || 0),
      0,
    );

    return { totalBudget: total, totalSpent: spent };
  }, [budgetsData]);

  const remaining = Math.max(totalBudget - totalSpent, 0);
  const percentUsed =
    totalBudget <= 0
      ? 0
      : Math.min(Math.round((totalSpent / totalBudget) * 100), 100);
  const formattedRemaining = formatCurrency(remaining);
  const clampedProgress = Math.min(Math.max(percentUsed, 0), 100);
  const progressDashoffset =
    PROGRESS_CIRCUMFERENCE - (clampedProgress / 100) * PROGRESS_CIRCUMFERENCE;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchBudgets();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenActions = (category: BudgetCategory) => {
    setActiveCategory(category);
    setIsActionSheetOpen(true);
  };

  const closeActionSheet = () => {
    setIsActionSheetOpen(false);
    setActiveCategory(null);
  };

  return (
    <MainContainer edges={[]} className="pb-0">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="bg-purpleLight px-6 py-6">
          <View className="flex-row items-center justify-between">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full">
              <Ionicons
                name="chevron-back"
                size={20}
                color={COLORS.textColor}
              />
            </Pressable>
            <View className="flex-row items-center gap-2">
              <Text weight="semibold" className="text-base text-textColor">
                September 2025
              </Text>
              <Pressable className=" flex-row items-center">
                <Image
                  source={require("@/assets/icons/calendar.svg")}
                  style={{ width: 20, height: 20 }}
                />
              </Pressable>
            </View>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full">
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textColor}
              />
            </Pressable>
          </View>

          <View className="mt-6">
            <View className="items-center justify-center">
              <View
                style={{ width: PROGRESS_SIZE, height: PROGRESS_SIZE }}
                className="items-center justify-center"
              >
                <Svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${PROGRESS_SIZE} ${PROGRESS_SIZE}`}
                >
                  <Circle
                    cx={PROGRESS_SIZE / 2}
                    cy={PROGRESS_SIZE / 2}
                    r={PROGRESS_RADIUS}
                    stroke={COLORS.purpleLight}
                    strokeWidth={PROGRESS_STROKE_WIDTH}
                    fill="none"
                  />
                  <Circle
                    cx={PROGRESS_SIZE / 2}
                    cy={PROGRESS_SIZE / 2}
                    r={PROGRESS_RADIUS}
                    stroke={COLORS.purple}
                    strokeWidth={PROGRESS_STROKE_WIDTH}
                    strokeDasharray={`${PROGRESS_CIRCUMFERENCE} ${PROGRESS_CIRCUMFERENCE}`}
                    strokeDashoffset={progressDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(-90 ${PROGRESS_SIZE / 2} ${PROGRESS_SIZE / 2})`}
                  />
                </Svg>
                <View className="absolute inset-0 items-center justify-center">
                  <View className="size-36 items-center justify-center rounded-full bg-white">
                    <Text weight="semibold" className="text-3xl">
                      {percentUsed}%
                    </Text>
                    <Text className="text-xs text-textColor/60">Used</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mt-6 flex-row justify-between">
              <View>
                <Text className="text-xs uppercase text-textColor/60">
                  Total Budget
                </Text>
                <Text
                  weight="semibold"
                  className="mt-1 text-base text-textColor"
                >
                  {formatCurrency(totalBudget)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs uppercase text-textColor/60">
                  Total Spent
                </Text>
                <Text weight="semibold" className="mt-1 text-base text-orange">
                  {formatCurrency(totalSpent)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs uppercase text-textColor/60">
                  Remaining
                </Text>
                <Text
                  weight="semibold"
                  className="mt-1 text-base"
                  style={{ color: "#2FA89A" }}
                >
                  {formattedRemaining}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="mt-6 px-6">
          <View className=" rounded-xl border border-red-400 bg-red-100/60 px-2.5 py-5">
            <View className="flex-row items-center justify-between">
              <Image
                source={require("@/assets/icons/info.svg")}
                style={{ width: 24, height: 24, marginRight: 8 }}
              />

              <View className="flex-1 pr-4">
                <Text weight="bold" className="text-sm text-textColor">
                  Food & Drink budget almost exceeded
                </Text>
                <Text className="mt-2 text-sm text-red-400">
                  ₦15,500 of ₦16,500
                </Text>
              </View>
              <Pressable className="rounded border border-red-500 px-3 py-2">
                <Text weight="semibold" className="text-sm  text-red-500">
                  Adjust
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text weight="semibold" className="text-lg text-textColor">
            Budget Category
          </Text>

          {isLoadingBudgets ? (
            <View className="mt-4">
              <Text className="text-center text-textColor/60">
                Loading budgets...
              </Text>
            </View>
          ) : budgetCategories.length === 0 ? (
            <View className="mt-4">
              <Text className="text-center text-textColor/60">
                No budgets found. Create your first budget to get started.
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-4">
              {budgetCategories.map((category, idx) => {
                const meta = statusMeta[category.status];
                const remainingValue =
                  category.remaining !== undefined
                    ? category.remaining
                    : Math.max(category.allocated - category.spent, 0);
                return (
                  <View
                    key={idx}
                    className="rounded-3xl border border-grayLight bg-white p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="w-full flex-row items-start  gap-4">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary_100">
                          <Image
                            source={category.icon}
                            style={{ width: 28, height: 28 }}
                            contentFit="contain"
                          />
                        </View>
                        <View>
                          <Text
                            weight="semibold"
                            className="text-base text-textColor"
                          >
                            {category.label}
                          </Text>
                          <Text className="mt-1 text-xs text-textColor/50">
                            {category.dueDate}
                          </Text>
                        </View>

                        <View
                          className="rounded-full px-3 py-1"
                          style={{ backgroundColor: meta.badgeBg }}
                        >
                          <Text
                            className="text-xs"
                            style={{ color: meta.textColor }}
                          >
                            {meta.label}
                          </Text>
                        </View>
                        <Pressable
                          className="ml-auto"
                          onPress={() => handleOpenActions(category)}
                        >
                          <Image
                            source={require("@/assets/icons/more.svg")}
                            style={{ width: 24, height: 24 }}
                          />
                        </Pressable>
                      </View>
                    </View>

                    <View className="mt-4">
                      <View className="mb-2 h-2 rounded-full bg-gray-200">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              (category.spent / category.allocated) * 100,
                              100,
                            )}%`,
                            backgroundColor: meta.accentColor,
                          }}
                        />
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-secondary_500">
                          {formatCurrency(category.spent)} of{" "}
                          {formatCurrency(category.allocated)}
                        </Text>
                        <Text className="text-sm text-textColor/90">
                          {formatCurrency(remainingValue)}{" "}
                          <Text className="text-textColor/70">left</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View className="mt-6 px-6">
          <ImageBackground
            style={{
              backgroundColor: COLORS.secondary_200,
              padding: 20,
              borderRadius: 24,
            }}
            source={require("@/assets/images/bg-patterns/fold-pattern.png")}
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={require("@/assets/icons/clock.svg")}
                style={{ width: 20, height: 20 }}
              />
              <Text weight="bold" className="text-lg">
                Smart Budget Tips
              </Text>
            </View>
            <View className="mt-3 space-y-3">
              <View className="flex-row items-start gap-2">
                <View
                  className="mt-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COLORS.secondary_500 }}
                />
                <Text className="mb-3 flex-1 text-sm text-textColor/80">
                  <Text className="mb-1 text-base">
                    Reduce food expenses by ₦5,000
                  </Text>
                  {"\n"}
                  You’re spending ₦20,000 more than similar users. Try cooking
                  at home 2 more days weekly.
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <View
                  className="mt-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COLORS.secondary_500 }}
                />
                <Text className="flex-1 text-sm text-textColor/80">
                  <Text className="mb-1 text-base">
                    Set up Down Owambe budget
                  </Text>
                  {"\n"}
                  December is party season! Create a separate budget for events
                  and overspending.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      </ScrollView>

      <SlideUpModal
        visible={isActionSheetOpen}
        onClose={closeActionSheet}
        title="Action"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        className="px-0"
      >
        <View className="gap-2">
          {["Edit", "Delete", "Archive"].map((action) => (
            <Pressable
              key={action}
              className="rounded-2xl bg-white px-4 py-3"
              onPress={closeActionSheet}
            >
              <Text className="text-base text-textColor">{action}</Text>
            </Pressable>
          ))}
        </View>
        {activeCategory && (
          <Text className="mt-4 text-center text-xs text-textColor/60">
            Selected: {activeCategory.label}
          </Text>
        )}
      </SlideUpModal>
    </MainContainer>
  );
};

export default BudgetScreen;
