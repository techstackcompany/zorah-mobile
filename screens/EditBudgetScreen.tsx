import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  useGetBudgetQuery,
  useUpdateBudgetMutation,
} from "@/src/api/hooks/useBudgetApi";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Toast from "react-native-toast-message";

type BudgetPeriodKey = "this_week" | "this_month" | "this_year" | "custom";

type DateRange = {
  start: Date;
  end: Date;
};

type OptionalDateRange = {
  start: Date | null;
  end: Date | null;
};

type LocalParams = {
  id?: string;
  name?: string;
  amount?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
};

const startOfWeek = (reference: Date) => {
  const date = new Date(reference);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfWeek = (reference: Date) => {
  const start = startOfWeek(reference);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const startOfMonth = (reference: Date) => {
  const date = new Date(reference.getFullYear(), reference.getMonth(), 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfMonth = (reference: Date) => {
  const date = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfYear = (reference: Date) => {
  const date = new Date(reference.getFullYear(), 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfYear = (reference: Date) => {
  const date = new Date(reference.getFullYear(), 11, 31);
  date.setHours(23, 59, 59, 999);
  return date;
};

const getPresetRange = (key: Exclude<BudgetPeriodKey, "custom">): DateRange => {
  const today = new Date();
  switch (key) {
    case "this_week":
      return { start: startOfWeek(today), end: endOfWeek(today) };
    case "this_month":
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "this_year":
      return { start: startOfYear(today), end: endOfYear(today) };
    default:
      return { start: startOfMonth(today), end: endOfMonth(today) };
  }
};

const formatDateInput = (value: Date | null) => {
  if (!value) {
    return "";
  }
  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatRangeLabel = (range: DateRange | null) => {
  if (!range) {
    return "Select budget period";
  }
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
  });
  const startLabel = formatter.format(range.start);
  const endLabel = formatter.format(range.end);
  return `${startLabel} - ${endLabel}`;
};

const CATEGORY_MAP: Record<string, string> = {
  food: "Food",
  entertainment: "Entertainment",
  transport: "Transport",
  shopping: "Shopping",
};

const REVERSE_CATEGORY_MAP: Record<string, string> = {
  Food: "food",
  Entertainment: "entertainment",
  Transport: "transport",
  Shopping: "shopping",
};

// Map UI period keys to API period values
const PERIOD_MAP: Record<BudgetPeriodKey, "weekly" | "monthly" | "yearly"> = {
  this_week: "weekly",
  this_month: "monthly",
  this_year: "yearly",
  custom: "monthly", // Default for custom, will be determined by date range
};

// Reverse map: API period values to UI keys
const REVERSE_PERIOD_MAP: Record<string, BudgetPeriodKey> = {
  weekly: "this_week",
  monthly: "this_month",
  yearly: "this_year",
};

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Determine period from date range
const determinePeriodFromRange = (
  range: DateRange,
): "weekly" | "monthly" | "yearly" => {
  const daysDiff = Math.ceil(
    (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysDiff <= 7) return "weekly";
  if (daysDiff <= 31) return "monthly";
  return "yearly";
};

const parseInitialAmount = (value?: string) => {
  if (!value) {
    return "";
  }

  const digitsOnly = value.replace(/[^0-9.]/g, "");
  if (!digitsOnly) {
    return "";
  }

  const [integerPartRaw = "", decimals = ""] = digitsOnly.split(".");
  const integerPart = integerPartRaw.replace(/^0+(?=\d)/, "") || "0";
  const cleanedDecimals = decimals.slice(0, 2);
  return cleanedDecimals ? `${integerPart}.${cleanedDecimals}` : integerPart;
};

const parseInitialRange = (start?: string, end?: string): DateRange | null => {
  if (!start || !end) {
    return null;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const [normalizedStart, normalizedEnd] =
    startDate <= endDate ? [startDate, endDate] : [endDate, startDate];

  normalizedStart.setHours(0, 0, 0, 0);
  normalizedEnd.setHours(23, 59, 59, 999);

  return {
    start: normalizedStart,
    end: normalizedEnd,
  };
};

const EditBudgetScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<LocalParams>();
  const budgetId = params.id;

  const {
    data: budget,
    isLoading: isLoadingBudget,
    error: budgetError,
  } = useGetBudgetQuery(budgetId);

  const initialRange = useMemo(() => {
    if (budget?.startDate && budget?.endDate) {
      const range = parseInitialRange(
        budget.startDate as string,
        budget.endDate as string,
      );
      if (range) return range;
    }
    if (params.startDate && params.endDate) {
      const range = parseInitialRange(params.startDate, params.endDate);
      if (range) return range;
    }
    return getPresetRange("this_month");
  }, [budget?.startDate, budget?.endDate, params.startDate, params.endDate]);

  const [budgetName, setBudgetName] = useState(
    budget?.category || params.name || "Food & Drinks",
  );
  const [amount, setAmount] = useState(() => {
    if (budget?.amount || budget?.Limit) {
      return parseInitialAmount(String(budget.amount || budget.Limit));
    }
    if (params.amount) {
      return parseInitialAmount(params.amount);
    }
    return "80000";
  });
  const [isBudgetNameFocused, setIsBudgetNameFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [periodKey, setPeriodKey] = useState<BudgetPeriodKey>(() => {
    if (budget?.period && REVERSE_PERIOD_MAP[budget.period]) {
      return REVERSE_PERIOD_MAP[budget.period];
    }
    if (budget?.startDate && budget?.endDate) {
      return "custom";
    }
    if (params.startDate && params.endDate) {
      return "custom";
    }
    return "this_month";
  });
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange);
  const isPeriodModalVisible = useSharedValue(false);
  const isCustomModalVisible = useSharedValue(false);
  const [customRangeDraft, setCustomRangeDraft] = useState<OptionalDateRange>({
    start: null,
    end: null,
  });

  useEffect(() => {
    if (budget) {
      if (budget.category) {
        const mappedCategory = REVERSE_CATEGORY_MAP[budget.category];
        if (mappedCategory) {
          setSelectedCategory(mappedCategory);
        }
        setBudgetName(budget.category);
      }
      if (budget.amount || budget.Limit) {
        setAmount(parseInitialAmount(String(budget.amount || budget.Limit)));
      }
      if (budget.startDate && budget.endDate) {
        const range = parseInitialRange(budget.startDate, budget.endDate);
        if (range) {
          setSelectedRange(range);
          if (budget.period && REVERSE_PERIOD_MAP[budget.period]) {
            setPeriodKey(REVERSE_PERIOD_MAP[budget.period]);
          } else {
            setPeriodKey("custom");
          }
        }
      }
    }
  }, [budget]);

  const updateBudgetMutation = useUpdateBudgetMutation(budgetId, {
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({
        queryKey: ["budgets", "detail", budgetId],
      });

      Toast.show({
        type: "success",
        text1: "Budget Updated",
        text2: response.message || "Your budget has been updated successfully.",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error) => {
      console.log("=== UPDATE BUDGET ERROR ===");
      console.log("Error object:", error);
      console.log("Error message:", error.message);
      console.log("Error status:", error.status);
      console.log("Error data:", error.data);
      console.log("========================\n");

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update budget. Please try again.",
      });
    },
  });

  const handleSelectPeriod = (key: BudgetPeriodKey) => {
    if (key === "custom") {
      isPeriodModalVisible.value = false;
      setCustomRangeDraft({
        start: selectedRange.start,
        end: selectedRange.end,
      });
      isCustomModalVisible.value = true;
      return;
    }

    const range = getPresetRange(key);
    setSelectedRange(range);
    setPeriodKey(key);
    isPeriodModalVisible.value = false;
  };

  const handleApplyCustomRange = () => {
    if (!customRangeDraft.start || !customRangeDraft.end) {
      return;
    }

    const [start, end] =
      customRangeDraft.start <= customRangeDraft.end
        ? [customRangeDraft.start, customRangeDraft.end]
        : [customRangeDraft.end, customRangeDraft.start];

    setSelectedRange({
      start: new Date(start),
      end: new Date(end),
    });
    setPeriodKey("custom");
    isCustomModalVisible.value = false;
  };

  const handleSubmit = () => {
    if (!selectedRange || !budgetId) {
      return;
    }

    // Determine period - use mapped value or determine from custom range
    const apiPeriod =
      periodKey === "custom"
        ? determinePeriodFromRange(selectedRange)
        : PERIOD_MAP[periodKey];

    // Use budgetName if it's been edited, otherwise use the mapped category
    const categoryName = budgetName.trim() || CATEGORY_MAP[selectedCategory];

    const payload = {
      category: categoryName,
      amount: Number(amount),
      period: apiPeriod,
      startDate: formatDateForAPI(selectedRange.start),
      endDate: formatDateForAPI(selectedRange.end),
    };

    updateBudgetMutation.mutate(payload);
  };

  const isSubmitDisabled =
    !budgetName.trim() ||
    !amount ||
    Number.isNaN(Number(amount)) ||
    Number(amount) <= 0 ||
    !selectedRange ||
    !budgetId ||
    updateBudgetMutation.isPending;

  const periodLabel = formatRangeLabel(selectedRange);
  const canApplyCustom = Boolean(
    customRangeDraft.start && customRangeDraft.end,
  );

  // Show loading state
  if (isLoadingBudget) {
    return (
      <MainContainer className="bg-light" edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-textColor/60">Loading budget...</Text>
        </View>
      </MainContainer>
    );
  }

  // Show error state
  if (budgetError || !budget) {
    return (
      <MainContainer className="bg-light" edges={[]}>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.error}
          />
          <Text className="mt-4 text-center text-base text-textColor">
            {budgetError?.message || "Failed to load budget"}
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            className="mt-6"
          />
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer className="bg-light" edges={[]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <View className="flex-1">
          <ScrollView
            className="flex-1 px-6 pt-4"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerClassName="pb-24"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="mt-4 gap-6">
              <View>
                <Text className="text-sm text-textColor/70">Budget name</Text>
                <TextInput
                  value={budgetName}
                  onChangeText={setBudgetName}
                  onFocus={() => setIsBudgetNameFocused(true)}
                  onBlur={() => setIsBudgetNameFocused(false)}
                  placeholder="e.g., Food & Dining"
                  className={`mt-2 rounded-2xl border bg-white px-4 py-4 font-nunitoMedium text-base text-textColor ${
                    isBudgetNameFocused
                      ? "border-primary_400"
                      : "border-gray-200"
                  }`}
                  placeholderTextColor="rgba(42, 58, 80, 0.4)"
                  returnKeyType="next"
                />
              </View>

              <AmountInput
                value={amount}
                onChangeValue={setAmount}
                placeholderTextColor="rgba(42,58,80,0.35)"
              />

              <View>
                <Text className="text-sm text-textColor/70">Budget Type</Text>
                <CategorySelector
                  categories={[]}
                  selectedKey={selectedCategory}
                  onSelect={setSelectedCategory}
                  className="mt-3"
                />
              </View>

              <View>
                <Text className="text-sm text-textColor/70">Budget Period</Text>
                <Pressable
                  onPress={() => (isPeriodModalVisible.value = true)}
                  className="mt-2 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4"
                >
                  <Text
                    className={
                      periodLabel === "Select budget period"
                        ? "text-base text-textColor/50"
                        : "text-base text-textColor"
                    }
                  >
                    {periodLabel}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={COLORS.textColor}
                  />
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <View className="px-6 pb-6">
            <Button
              title="Update Budget"
              disabled={isSubmitDisabled}
              className="w-full"
              onPress={handleSubmit}
            />
          </View>
        </View>

        <SlideUpModal
          isOpen={isPeriodModalVisible}
          onClose={() => (isPeriodModalVisible.value = false)}
          title="Budget Period"
          headerTextColor="white"
        >
          <View className="gap-4">
            {[
              { key: "this_week", label: "This Week" },
              { key: "this_month", label: "This Month" },
              { key: "this_year", label: "This Year" },
              { key: "custom", label: "Custom Date" },
            ].map((option) => {
              const isActive = periodKey === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() =>
                    handleSelectPeriod(option.key as BudgetPeriodKey)
                  }
                  className="flex-row items-center justify-between rounded-2xl px-4 py-4"
                >
                  <Text
                    weight="semibold"
                    className={
                      isActive
                        ? "text-base text-primary_400"
                        : "text-base text-textColor"
                    }
                  >
                    {option.label}
                  </Text>
                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={COLORS.primary_400}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </SlideUpModal>

        <SlideUpModal
          isOpen={isCustomModalVisible}
          onClose={() => (isCustomModalVisible.value = false)}
          title="Custom Period"
          headerBackgroundColor={COLORS.primary_400}
          headerTextColor="#fff"
          closeIconColor="#fff"
          className="h-[500px]"
        >
          <View className="h-full gap-4">
            <View>
              <Text className="text-sm text-textColor/70">Start Date</Text>
              <DatePickerField
                value={formatDateInput(customRangeDraft.start)}
                onChange={(_, raw) =>
                  setCustomRangeDraft((prev) => ({
                    ...prev,
                    start: raw ? new Date(raw) : null,
                  }))
                }
              />
            </View>
            <View>
              <Text className="text-sm text-textColor/70">End Date</Text>
              <DatePickerField
                value={formatDateInput(customRangeDraft.end)}
                onChange={(_, raw) =>
                  setCustomRangeDraft((prev) => ({
                    ...prev,
                    end: raw ? new Date(raw) : null,
                  }))
                }
              />
            </View>
            <Button
              title="Apply Period"
              onPress={handleApplyCustomRange}
              disabled={!canApplyCustom}
              className="mt-auto"
            />
          </View>
        </SlideUpModal>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default EditBudgetScreen;
