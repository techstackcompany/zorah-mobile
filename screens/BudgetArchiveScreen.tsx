import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatCurrency } from "@/lib/utils";
import {
  useGetArchivedBudgetsQuery,
  useGetCategoriesQuery,
  useRestoreBudgetMutation,
} from "@/src/api/hooks";
import { BudgetListItem } from "@/src/api/types";
import { useQueryClient } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type ArchiveStatus = "on-track" | "approaching" | "exceeded";

type ArchivedBudget = {
  id: string;
  name: string;
  icon: string | ImageSource;
  status: ArchiveStatus;
  archivedDate: string;
  allocated: number;
  spent: number;
  remaining: number;
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

type ArchiveAction = {
  label: string;
  enabled: boolean;
  action: () => void;
};

const getBudgetStatus = (spent: number, allocated: number): ArchiveStatus => {
  const remaining = allocated - spent;
  if (remaining <= 0) return "exceeded";
  if (allocated > 0 && remaining < allocated * 0.1) return "approaching";
  return "on-track";
};

const transformArchivedBudgets = (
  budgetsData: BudgetListItem[],
  subcategories: { key: string; label: string; icon: string }[],
) => {
  return budgetsData.map((budget: BudgetListItem) => {
    const spent = budget.totalSpent ?? budget.spent ?? 0;
    const allocated = budget.Limit ?? budget.amount ?? 0;
    const remaining = budget.remaining ?? Math.max(allocated - spent, 0);

    let status: ArchiveStatus;
    const statusLabel =
      budget.status ||
      (remaining <= 0
        ? "over budget 🚨"
        : remaining < allocated * 0.1
          ? "Almost reached ⛔️"
          : "On track ✅");

    const statusLower = statusLabel.toLowerCase();
    if (
      statusLower.includes("exceeded") ||
      statusLower.includes("over budget") ||
      statusLower.includes("over")
    ) {
      status = "exceeded";
    } else if (
      statusLower.includes("almost reached") ||
      statusLower.includes("approaching") ||
      statusLower.includes("warning")
    ) {
      status = "approaching";
    } else {
      status = getBudgetStatus(spent, allocated);
    }

    let archivedDate = "Archived";

    return {
      id: budget._id,
      name: budget.category || "Unknown",
      icon:
        subcategories?.find(
          (subcategory) => subcategory.key === budget.category,
        )?.icon || "",
      status,
      archivedDate,
      allocated,
      spent,
      remaining,
    };
  });
};


const BudgetArchiveScreen = () => {
  const [selectedBudget, setSelectedBudget] = useState<ArchivedBudget | null>(
    null,
  );
  const actionSheetRef = useRef<SlideUpModalRef>(null);
  const [budgetIdToRestore, setBudgetIdToRestore] = useState<string | null>(
    null,
  );

  const queryClient = useQueryClient();
  const {
    data: archivedBudgetsData,
    isLoading: isLoadingArchived,
    refetch: refetchArchived,
  } = useGetArchivedBudgetsQuery();
  const {data:subcategories} = useGetCategoriesQuery("budget");

  const archivedBudgets = useMemo(() => {
    if (!archivedBudgetsData) return [];
    if(!subcategories) return [];
    const rawBudgets = Array.isArray(archivedBudgetsData)
      ? archivedBudgetsData
      : archivedBudgetsData.data || [];

    return transformArchivedBudgets(rawBudgets, subcategories);
  }, [archivedBudgetsData, subcategories]);

  const restoreBudgetMutation = useRestoreBudgetMutation(
    budgetIdToRestore || "",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "archived"] });
        Toast.show({ type: "success", text1: "Budget restored successfully" });
        setBudgetIdToRestore(null);
        setSelectedBudget(null);
        actionSheetRef.current?.dismiss();
      },
      onError: (error) => {
        console.log("error", error.message);
        Toast.show({ type: "error", text1: "Failed to restore budget" });
        setBudgetIdToRestore(null);
      },
    },
  );

  useEffect(() => {
    if (budgetIdToRestore && !restoreBudgetMutation.isPending) {
      restoreBudgetMutation.mutate();
    }
  }, [budgetIdToRestore, restoreBudgetMutation]);

  const handleRestoreBudget = (budgetId: string) => {
    setBudgetIdToRestore(budgetId);
  };

  const handleOpenActions = (budget: ArchivedBudget) => {
    setSelectedBudget(budget);
    actionSheetRef.current?.present();
  };

  const closeActionSheet = () => {
    actionSheetRef.current?.dismiss();
    setSelectedBudget(null);
  };

  const actions: ArchiveAction[] = useMemo(() => {
    if (!selectedBudget) return [];
    return [
      {
        label: "Restore",
        enabled: true,
        action: () => {
          actionSheetRef.current?.dismiss();
          handleRestoreBudget(selectedBudget.id);
        },
      },
      {
        label: "Delete",
        enabled: false,
        action: () => {},
      },
    ];
  }, [selectedBudget]);

  const hasArchivedBudgets = archivedBudgets.length > 0;

  return (
    <MainContainer edges={[]} className="bg-lightMuted">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-24 flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingArchived}
            onRefresh={refetchArchived}
          />
        }
      >
        {isLoadingArchived ? (
          <View className="mt-8 flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color={COLORS.primary_400} />
            <Text className="mt-4 text-textColor/60">
              Loading archived budgets...
            </Text>
          </View>
        ) : hasArchivedBudgets ? (
          <>
            <View className="mt-8">
              <Text weight="semibold" className="text-lg text-textColor">
                My Archive
              </Text>

              <View className="mt-4 gap-4">
                {archivedBudgets.map((budget) => {
                  const meta = STATUS_META[budget.status];
                  const remainingValue =
                    budget.remaining ||
                    Math.max(budget.allocated - budget.spent, 0);
                  const progress =
                    budget.allocated <= 0
                      ? 0
                      : Math.min((budget.spent / budget.allocated) * 100, 100);

                  const iconSource =
                    typeof budget.icon === "string"
                      ? { uri: budget.icon }
                      : budget.icon;

                  return (
                    <Pressable
                      key={budget.id}
                      className="rounded-3xl border border-grayLight/90 bg-white p-4"
                      onPress={() => handleOpenActions(budget)}
                    >
                      <View className="flex-row items-start gap-4">
                        <View className="flex-1">
                          <View className="h-12 flex-row items-start gap-2">
                            <View className="aspect-square h-full items-center justify-center rounded-full bg-primary_100">
                              <Image
                                source={iconSource}
                                style={{ width: 24, height: 24 }}
                                contentFit="contain"
                              />
                            </View>
                            <View className="h-full justify-between">
                              <Text
                                weight="semibold"
                                className="text-base text-textColor"
                              >
                                {budget.name}
                              </Text>
                              <Text className=" text-xs text-textColor/50">
                                {budget.archivedDate}
                              </Text>
                            </View>
                            <View
                              className="me-auto rounded-full px-3 py-1"
                              style={{
                                backgroundColor: COLORS.secondary_150,
                              }}
                            >
                              <Text
                                className="text-xs"
                                style={{ color: COLORS.secondary_500 }}
                              >
                                {meta.label}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => handleOpenActions(budget)}
                            >
                              <Image
                                source={require("@/assets/icons/more.svg")}
                                style={{ width: 24, height: 24 }}
                              />
                            </Pressable>
                          </View>

                          <View className="mt-4">
                            <View className="mb-2 h-2 rounded-full bg-gray-200">
                              <View
                                className="h-full rounded-full"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: meta.accentColor,
                                }}
                              />
                            </View>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-sm text-secondary_500">
                                {formatCurrency(budget.spent)} of{" "}
                                {formatCurrency(budget.allocated)}
                              </Text>
                              <Text className="text-sm text-textColor ">
                                {formatCurrency(remainingValue)}{" "}
                                <Text className="text-textColor/70">left </Text>
                              </Text>
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
            <View className="w-full flex-1  items-center justify-center rounded-[32px] border border-[#F2F2F2] bg-[#FAFAFA] px-6 py-12">
              <View className="items-center justify-center gap-6">
                <View className="h-32 w-32 rounded-3xl bg-white">
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
        ref={actionSheetRef}
        onClose={closeActionSheet}
        title="Action"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        className="px-0"
      >
        <View className="gap-2">
          {actions.map((action) => (
            <Pressable
              key={action.label}
              disabled={!action.enabled}
              onPress={() => {
                action.action();
                if (action.enabled) {
                  closeActionSheet();
                }
              }}
              className={`rounded-2xl bg-white px-4 py-3 ${
                action.enabled ? "" : "opacity-40"
              }`}
            >
              <Text
                className={`text-base ${
                  action.enabled ? "text-textColor" : "text-textColor/40"
                }`}
              >
                {action.label}
              </Text>
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
