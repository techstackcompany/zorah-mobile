import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import {
  useCreateBudgetMutation,
  useGetCategoriesQuery,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

// Map UI period keys to API period values
const PERIOD_MAP: Record<BudgetPeriodKey, "weekly" | "monthly" | "yearly"> = {
  this_week: "weekly",
  this_month: "monthly",
  this_year: "yearly",
  custom: "monthly", // Default for custom, will be determined by date range
};

// Format date to YYYY-MM-DD
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

const CreateBudgetScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: budgetCategories, isLoading: isCategoriesLoading } = useGetCategoriesQuery("budget");
  const firstCategory = budgetCategories?.[0]?.key;
  const [budgetName, setBudgetName] = useState("");
  const [amount, setAmount] = useState("");
  const [isBudgetNameFocused, setIsBudgetNameFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    firstCategory || "",
  );
  const [periodKey, setPeriodKey] = useState<BudgetPeriodKey>("this_month");
  const [selectedRange, setSelectedRange] = useState<DateRange>(() =>
    getPresetRange("this_month"),
  );
  const isPeriodModalOpen = useSharedValue(false);
  const isCustomModalOpen = useSharedValue(false);
  const [customRangeDraft, setCustomRangeDraft] = useState<OptionalDateRange>({
    start: null,
    end: null,
  });

  const createBudgetMutation = useCreateBudgetMutation({
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });

      Toast.show({
        type: "success",
        text1: "Budget Created",
        text2: response.message || "Your budget has been created successfully.",
      });

      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create budget. Please try again.",
      });
    },
  });

  const handleSelectPeriod = (key: BudgetPeriodKey) => {
    if (key === "custom") {
      isPeriodModalOpen.value = false;
      setCustomRangeDraft({
        start: selectedRange.start,
        end: selectedRange.end,
      });
      isCustomModalOpen.value = true;
      return;
    }

    const range = getPresetRange(key);
    setSelectedRange(range);
    setPeriodKey(key);
    isPeriodModalOpen.value = false;
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
    isCustomModalOpen.value = false;
  };

  const isSubmitDisabled =
    !budgetName.trim() ||
    !amount ||
    Number.isNaN(Number(amount)) ||
    Number(amount) <= 0 ||
    !selectedRange ||
    !selectedCategory;

  const periodLabel = formatRangeLabel(selectedRange);
  const canApplyCustom = Boolean(
    customRangeDraft.start && customRangeDraft.end,
  );

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
                  categories={budgetCategories || []}
                  selectedKey={selectedCategory}
                  onSelect={(key) => setSelectedCategory(key)}
                  className="mt-3"
                  
                />
              </View>

              <View>
                <Text className="text-sm text-textColor/70">Budget Period</Text>
                <Pressable
                  onPress={() => (isPeriodModalOpen.value = true)}
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
              title="Create Budget"
              disabled={isSubmitDisabled || createBudgetMutation.isPending}
              className="w-full"
              onPress={() => {
                const apiPeriod =
                  periodKey === "custom"
                    ? determinePeriodFromRange(selectedRange)
                    : PERIOD_MAP[periodKey];

                const payload = {
                  category: selectedCategory,
                  amount: Number(amount),
                  period: apiPeriod,
                  startDate: formatDateForAPI(selectedRange.start),
                  endDate: formatDateForAPI(selectedRange.end),
                };

                createBudgetMutation.mutate(payload);
              }}
            />
          </View>
        </View>

        <SlideUpModal
          isOpen={isPeriodModalOpen}
          onClose={() => (isPeriodModalOpen.value = false)}
          title="Budget Period"
          headerTextColor="white"
        >
          <View className="h-full gap-4">
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
                    className={cn(
                      "flex-1 text-base",
                      isActive ? "text-primary_400" : "text-textColor",
                    )}
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
          isOpen={isCustomModalOpen}
          onClose={() => (isCustomModalOpen.value = false)}
          title="Custom Period"
          headerBackgroundColor={COLORS.primary_400}
          headerTextColor="#fff"
          closeIconColor="#fff"
          className="h-[500px]"
        >
          <View className="h-full  gap-4">
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

export default CreateBudgetScreen;
