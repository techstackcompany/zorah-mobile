import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import AmountInput from "@/components/ui/AmountInput";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ImageSource } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

type BudgetCategoryKey = "food" | "entertainment" | "transport" | "shopping";

const BUDGET_CATEGORIES = [
  {
    key: "food",
    label: "Food",
    icon: require("@/assets/images/home/food.png"),
  },
  {
    key: "entertainment",
    label: "Entertainment",
    icon: require("@/assets/images/home/entertainment.png"),
  },
  {
    key: "transport",
    label: "Transport",
    icon: require("@/assets/images/home/transport.png"),
  },
  {
    key: "shopping",
    label: "Shopping",
    icon: require("@/assets/images/home/shopping.png"),
  },
] as const satisfies ReadonlyArray<{
  key: BudgetCategoryKey;
  label: string;
  icon: ImageSource;
}>;

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

const isBudgetCategoryKey = (
  value: string | undefined,
): value is BudgetCategoryKey => {
  return Boolean(value && BUDGET_CATEGORIES.some((item) => item.key === value));
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
  const params = useLocalSearchParams<LocalParams>();

  const initialRange =
    parseInitialRange(params.startDate, params.endDate) ??
    getPresetRange("this_month");

  const [budgetName, setBudgetName] = useState(params.name ?? "Food & Drinks");
  const [amount, setAmount] = useState(() =>
    params.amount ? parseInitialAmount(params.amount) : "80000",
  );
  const [isBudgetNameFocused, setIsBudgetNameFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<BudgetCategoryKey>(
      isBudgetCategoryKey(params.category) ? params.category : "food",
    );
  const [periodKey, setPeriodKey] = useState<BudgetPeriodKey>(
    params.startDate && params.endDate ? "custom" : "this_month",
  );
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange);
  const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false);
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);
  const [customRangeDraft, setCustomRangeDraft] = useState<OptionalDateRange>({
    start: null,
    end: null,
  });

  const handleSelectPeriod = (key: BudgetPeriodKey) => {
    if (key === "custom") {
      setIsPeriodModalVisible(false);
      setCustomRangeDraft({
        start: selectedRange.start,
        end: selectedRange.end,
      });
      setIsCustomModalVisible(true);
      return;
    }

    const range = getPresetRange(key);
    setSelectedRange(range);
    setPeriodKey(key);
    setIsPeriodModalVisible(false);
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
    setIsCustomModalVisible(false);
  };

  const handleSubmit = () => {
    if (!selectedRange) {
      return;
    }

    const payload = {
      id: params.id ?? "new-budget",
      name: budgetName.trim(),
      amount: Number(amount).toFixed(2),
      category: selectedCategory,
      periodKey,
      range: {
        start: selectedRange.start.toISOString(),
        end: selectedRange.end.toISOString(),
      },
    };

    router.back();
  };

  const isSubmitDisabled =
    !budgetName.trim() ||
    !amount ||
    Number.isNaN(Number(amount)) ||
    Number(amount) <= 0 ||
    !selectedRange;

  const periodLabel = formatRangeLabel(selectedRange);
  const canApplyCustom = Boolean(customRangeDraft.start && customRangeDraft.end);

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
                  className={`mt-2 rounded-2xl border bg-white px-4 py-4 text-base font-nunitoMedium text-textColor ${
                    isBudgetNameFocused ? "border-primary_400" : "border-gray-200"
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
                  categories={BUDGET_CATEGORIES}
                  selectedKey={selectedCategory}
                  onSelect={setSelectedCategory}
                  className="mt-3"
                />
              </View>

              <View>
                <Text className="text-sm text-textColor/70">Budget Period</Text>
                <Pressable
                  onPress={() => setIsPeriodModalVisible(true)}
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
          visible={isPeriodModalVisible}
          onClose={() => setIsPeriodModalVisible(false)}
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
                  onPress={() => handleSelectPeriod(option.key as BudgetPeriodKey)}
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
          visible={isCustomModalVisible}
          onClose={() => setIsCustomModalVisible(false)}
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
