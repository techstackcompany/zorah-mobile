import BudgetActionSheet from "@/components/budget/BudgetActionSheet";
import BudgetExceededAlert from "@/components/budget/BudgetExceededAlerts";
import BudgetListSection from "@/components/budget/BudgetListSection";
import BudgetPeriodNavigator from "@/components/budget/BudgetPeriodNavigator";
import BudgetSummary from "@/components/budget/BudgetSummary";
import DeleteBudgetModal from "@/components/budget/DeleteBudgetModal";
import MainContainer from "@/components/layouts/MainContainer";
import { useGetBudgetsQuery } from "@/src/api/hooks";
import React, { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import Text from "@/components/ui/Text";
import {
  useBudgetActions,
  useBudgetRefresh,
  useBudgetSummary,
  useBudgets,
  BudgetPeriod,
  getBudgetPeriod,
} from "@/features/budget";


const BudgetScreen = () => {
  const { isLoading: isLoadingBudgets, error: budgetsError } =
    useGetBudgetsQuery();
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const { rawBudgets, budgets, filteredRawBudgets } = useBudgets(selectedPeriod);
  const availablePeriods = useMemo(() => {
    const periods = rawBudgets
      .map(getBudgetPeriod)
      .filter((period): period is BudgetPeriod => !!period);

    if (periods.length === 0) return [];

    const uniquePeriods = Array.from(
      new Map(
        periods.map((period) => [`${period.year}-${period.month}`, period]),
      ).values(),
    );

    return uniquePeriods.sort(
      (a, b) =>
        new Date(a.year, a.month - 1, 1).getTime() -
        new Date(b.year, b.month - 1, 1).getTime(),
    );
  }, [rawBudgets]);
  useEffect(() => {
    if (availablePeriods.length === 0) return;

    const selectionKey = `${selectedPeriod.year}-${selectedPeriod.month}`;
    const selectionExists = availablePeriods.some(
      (period) => `${period.year}-${period.month}` === selectionKey,
    );

    if (!selectionExists) {
      setSelectedPeriod(availablePeriods[availablePeriods.length - 1]);
    }
  }, [availablePeriods, selectedPeriod]);
  const budgetSummary = useBudgetSummary(filteredRawBudgets);
  const budgetPeriodLabel = useMemo(() => {
    return new Date(
      selectedPeriod.year,
      selectedPeriod.month - 1,
      1,
    ).toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [selectedPeriod]);
  const selectedPeriodIndex = useMemo(
    () =>
      availablePeriods.findIndex(
        (period) =>
          period.month === selectedPeriod.month &&
          period.year === selectedPeriod.year,
      ),
    [availablePeriods, selectedPeriod],
  );
  const handlePreviousMonth = () => {
    if (selectedPeriodIndex > 0) {
      setSelectedPeriod(availablePeriods[selectedPeriodIndex - 1]);
    }
  };
  const handleNextMonth = () => {
    if (
      selectedPeriodIndex !== -1 &&
      selectedPeriodIndex < availablePeriods.length - 1
    ) {
      setSelectedPeriod(availablePeriods[selectedPeriodIndex + 1]);
    }
  };
  const { isRefreshing, handleRefresh } = useBudgetRefresh();
  const budgetActions = useBudgetActions();

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
          <BudgetPeriodNavigator
            label={budgetPeriodLabel}
            onPrevious={handlePreviousMonth}
            onNext={handleNextMonth}
            disablePrevious={selectedPeriodIndex <= 0}
            disableNext={
              selectedPeriodIndex === -1 ||
              selectedPeriodIndex >= availablePeriods.length - 1
            }
          />

          <BudgetSummary
            percentUsed={budgetSummary.percentUsed}
            totalBudget={budgetSummary.totalBudget}
            totalSpent={budgetSummary.totalSpent}
            formattedRemaining={budgetSummary.formattedRemaining}
          />
        </View>
        <View className="mt-6 px-6">
          <BudgetExceededAlert />
        </View>
        {budgetsError && budgets.length ===0 ? (
          <View className="mt-6 px-6">
            <Text className="text-center text-red-500">
              Failed to load budgets. Pull to refresh to try again.
            </Text>
          </View>
        ) : (
          <BudgetListSection
            budgets={budgets}
            isLoading={isLoadingBudgets}
            onMorePress={budgetActions.openActionSheet}
          />
        )}

      </ScrollView>

      <BudgetActionSheet
        visible={budgetActions.isActionSheetOpen}
        onClose={budgetActions.closeActionSheet}
        actions={budgetActions.actions}
        onActionPress={(action) => action.action()}
      />

      <DeleteBudgetModal
        visible={budgetActions.enableDeleteWarning}
        onClose={() => {
          budgetActions.setEnableDeleteWarning(false);
          budgetActions.setBudgetIdToDelete(null);
        }}
        onConfirm={budgetActions.deleteBudget}
        budgetName={budgetActions.activeCategory?.label}
        isDeleting={budgetActions.isDeletingBudget}
      />
    </MainContainer>
  );
};

export default BudgetScreen;
