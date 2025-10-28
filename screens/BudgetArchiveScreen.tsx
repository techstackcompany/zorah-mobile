import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Image, ImageSource } from "expo-image";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

type ArchiveStatus = "on-track" | "approaching" | "exceeded";

type ArchivedBudget = {
  id: string;
  name: string;
  icon: ImageSource;
  status: ArchiveStatus;
  archivedDate: string;
  allocated: number;
  spent: number;
};

const STATUS_META: Record<
  ArchiveStatus,
  { label: string; badgeBg: string; textColor: string; accentColor: string }
> = {
  "on-track": {
    label: "On Track",
    badgeBg: "#E6F5F3",
    textColor: "#2FA89A",
    accentColor: "#2FA89A",
  },
  approaching: {
    label: "Approaching Limit",
    badgeBg: "#FFF7E6",
    textColor: "#E9781A",
    accentColor: "#E9781A",
  },
  exceeded: {
    label: "Budget Exceeded",
    badgeBg: "#FDE8E8",
    textColor: "#D14343",
    accentColor: "#D14343",
  },
};

const ARCHIVED_BUDGETS: ArchivedBudget[] = [
  {
    id: "archived-food",
    name: "Food & Drinks",
    icon: require("@/assets/images/home/food.png"),
    status: "on-track",
    archivedDate: "01/09/2025",
    allocated: 80_000,
    spent: 65_420,
  },
];

const ARCHIVE_ACTIONS = [
  { label: "Edit", enabled: true },
  { label: "Delete", enabled: true },
  { label: "Archive", enabled: false },
] as const;

const formatCurrency = (value: number) =>
  `₦${value.toLocaleString("en-NG", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;

const BudgetArchiveScreen = () => {
  const [selectedBudget, setSelectedBudget] = useState<ArchivedBudget | null>(
    null,
  );
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const archiveTotal = ARCHIVED_BUDGETS.reduce(
    (acc, budget) => {
      acc.allocated += budget.allocated;
      acc.spent += budget.spent;
      return acc;
    },
    { allocated: 0, spent: 0 },
  );

  const handleOpenActions = useCallback((budget: ArchivedBudget) => {
    setSelectedBudget(budget);
    setIsActionSheetOpen(true);
  }, []);

  const closeActionSheet = useCallback(() => {
    setIsActionSheetOpen(false);
    setSelectedBudget(null);
  }, []);

  const hasArchivedBudgets = ARCHIVED_BUDGETS.length > 0;

  return (
    <MainContainer edges={[]} className="bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {hasArchivedBudgets ? (
          <>
            <View className="mt-6 rounded-3xl border border-grayLight/40 bg-white p-4 shadow-sm shadow-[#1018280D]">
              <Text className="text-xs uppercase text-textColor/60">
                Archive Summary
              </Text>
              <View className="mt-3 flex-row justify-between">
                <View>
                  <Text className="text-xs text-textColor/60">
                    Total Archived
                  </Text>
                  <Text
                    weight="semibold"
                    className="mt-1 text-base text-textColor"
                  >
                    {formatCurrency(archiveTotal.allocated)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-textColor/60">Total Spent</Text>
                  <Text weight="semibold" className="mt-1 text-base text-orange">
                    {formatCurrency(archiveTotal.spent)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-8">
              <Text weight="semibold" className="text-lg text-textColor">
                My Archive
              </Text>

              <View className="mt-4 gap-4">
                {ARCHIVED_BUDGETS.map((budget) => {
                  const meta = STATUS_META[budget.status];
                  const remainingValue = Math.max(
                    budget.allocated - budget.spent,
                    0,
                  );
                  const progress =
                    budget.allocated <= 0
                      ? 0
                      : Math.min((budget.spent / budget.allocated) * 100, 100);

                  return (
                    <Pressable
                      key={budget.id}
                      className="rounded-3xl border border-grayLight/50 bg-white p-4"
                      onPress={() => handleOpenActions(budget)}
                    >
                      <View className="flex-row items-start gap-4">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary_100">
                          <Image
                            source={budget.icon}
                            style={{ width: 28, height: 28 }}
                            contentFit="contain"
                          />
                        </View>

                        <View className="flex-1">
                          <View className="flex-row items-start gap-2">
                            <View className="flex-1">
                              <Text
                                weight="semibold"
                                className="text-base text-textColor"
                              >
                                {budget.name}
                              </Text>
                              <Text className="mt-1 text-xs text-textColor/50">
                                {budget.archivedDate}
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
                            <Pressable onPress={() => handleOpenActions(budget)}>
                              <Image
                                source={require("@/assets/icons/more.svg")}
                                style={{ width: 24, height: 24 }}
                              />
                            </Pressable>
                          </View>

                          <View className="mt-4">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-sm text-secondary_400">
                                {formatCurrency(budget.spent)} of{" "}
                                {formatCurrency(budget.allocated)}
                              </Text>
                              <Text className="text-sm text-textColor/90">
                                {formatCurrency(remainingValue)} left
                              </Text>
                            </View>
                            <View className="mt-2 h-2 rounded-full bg-gray-200">
                              <View
                                className="h-full rounded-full"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: meta.accentColor,
                                }}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <View className="mt-6 flex-1 items-center">
            <View className="w-full flex-1 rounded-[32px] border border-[#F2F2F2] bg-[#FAFAFA] px-6 py-12">
              <View className="flex-1 items-center justify-center gap-6">
                <View className="h-32 w-32 items-center justify-center rounded-3xl bg-white">
                  <Image
                    source={require("@/assets/images/home/no-archive.svg")}
                    style={{ width: 96, height: 96 }}
                  />
                </View>
                <View className="items-center gap-2">
                  <Text
                    weight="semibold"
                    className="text-lg"
                    style={{ color: COLORS.textColor }}
                  >
                    No archived information
                  </Text>
                  <Text className="text-sm" style={{ color: "#9CA3AF" }}>
                    All archive details will appear here
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
          {ARCHIVE_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              disabled={!action.enabled}
              onPress={action.enabled ? closeActionSheet : undefined}
              className={`rounded-2xl bg-white px-4 py-3 ${
                action.enabled ? "" : "opacity-40"
              }`}
            >
              <Text className="text-base text-textColor">{action.label}</Text>
            </Pressable>
          ))}
        </View>
        {selectedBudget && (
          <Text className="mt-4 text-center text-xs text-textColor/60">
            Selected: {selectedBudget.name}
          </Text>
        )}
      </SlideUpModal>
    </MainContainer>
  );
};

export default BudgetArchiveScreen;
