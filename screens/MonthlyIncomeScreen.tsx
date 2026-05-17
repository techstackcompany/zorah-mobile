import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import {
  CUSTOM_INCOME_SOURCE_VALUE,
  incomeRanges,
  incomeSources,
  setupInfo,
} from "@/constants/setup";
import useUserData from "@/contexts/auth-context/useUserData";
import useSetUpStep from "@/hooks/useSetUpStep";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/src/api/client";
import { useUpdateOnboardingMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

const normalizeStringList = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeIncomeSourceValue = (value: string): string | null => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const byValue = incomeSources.find(
    (source) => source.value.toLowerCase() === normalized,
  );
  if (byValue) {
    return byValue.value;
  }

  const byLabel = incomeSources.find(
    (source) => source.label.toLowerCase() === normalized,
  );
  return byLabel?.value ?? null;
};

const normalizeIncomeRangeValue = (value: string): string | undefined => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  const byValue = incomeRanges.find(
    (range) => range.value.toLowerCase() === normalized,
  );
  if (byValue) {
    return byValue.value;
  }

  const byLabel = incomeRanges.find(
    (range) => range.label.toLowerCase() === normalized,
  );
  return byLabel?.value;
};

const KNOWN_SOURCE_LABELS = new Set(
  incomeSources.map((source) => source.label.toLowerCase()),
);
const KNOWN_SOURCE_VALUES = new Set(
  incomeSources.map((source) => source.value.toLowerCase()),
);

const MonthlyIncomeScreen = () => {
  const userData = useUserData();
  const [primarySource, setPrimarySource] = useState<string[]>([]);
  const [customSource, setCustomSource] = useState("");
  const [monthlyRange, setMonthlyRange] = useState<string | undefined>();
  const updateOnboardingMutation = useUpdateOnboardingMutation();

  const { goToNextStep, goToPreviousStep } = useSetUpStep(2);

  const prefill = useMemo(() => {
    const safeUserData = (userData ?? {}) as Record<string, unknown>;
    const onboarding =
      safeUserData.onboarding && typeof safeUserData.onboarding === "object"
        ? (safeUserData.onboarding as Record<string, unknown>)
        : null;

    const rawIncomeSource =
      onboarding?.incomeSource ??
      safeUserData.incomeSource ??
      safeUserData.incomeSources;
    const rawIncomeRange =
      onboarding?.incomeRange ??
      safeUserData.incomeRange ??
      onboarding?.monthlyIncomeRange ??
      safeUserData.monthlyIncomeRange;

    const rawSourceList = normalizeStringList(rawIncomeSource);
    const knownSources = Array.from(
      new Set(
        rawSourceList
          .map(normalizeIncomeSourceValue)
          .filter((entry): entry is string => Boolean(entry)),
      ),
    );
    const customEntries = rawSourceList.filter((entry) => {
      const normalized = entry.toLowerCase();
      return (
        !KNOWN_SOURCE_LABELS.has(normalized) &&
        !KNOWN_SOURCE_VALUES.has(normalized)
      );
    });

    const resolvedSources =
      customEntries.length > 0 &&
      !knownSources.includes(CUSTOM_INCOME_SOURCE_VALUE)
        ? [...knownSources, CUSTOM_INCOME_SOURCE_VALUE]
        : knownSources;

    const prefilledRange =
      typeof rawIncomeRange === "string"
        ? normalizeIncomeRangeValue(rawIncomeRange)
        : undefined;

    const stepsCompleted = Array.isArray(onboarding?.stepsCompleted)
      ? (onboarding.stepsCompleted as unknown[]).filter(
          (entry): entry is string => typeof entry === "string",
        )
      : [];

    return {
      sources: resolvedSources,
      customEntries,
      range: prefilledRange,
      completed: stepsCompleted.includes(setupInfo[2].key),
    };
  }, [userData]);

  useEffect(() => {
    setPrimarySource((prev) => (prev.length > 0 ? prev : prefill.sources));
    setCustomSource((prev) => (prev ? prev : prefill.customEntries.join(", ")));
    setMonthlyRange((prev) => prev ?? prefill.range);
  }, [prefill]);

  const handlePrevious = () => {
    goToPreviousStep();
  };

  const customEntries = customSource
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const isCustomSelected = primarySource.includes(CUSTOM_INCOME_SOURCE_VALUE);
  const hasValidSelection =
    primarySource.length > 0 &&
    (!isCustomSelected ||
      primarySource.length > 1 ||
      customEntries.length > 0);

  const handleNext = async () => {
    if (prefill.completed && (!hasValidSelection || !monthlyRange)) {
      goToNextStep();
      return;
    }
    if (!hasValidSelection || !monthlyRange) {
      return;
    }

    const sortedCurrent = [...primarySource].sort();
    const sortedPrefill = [...prefill.sources].sort();
    const sortedCurrentCustom = [...customEntries].sort();
    const sortedPrefillCustom = [...prefill.customEntries].sort();
    const sourcesUnchanged =
      sortedCurrent.length === sortedPrefill.length &&
      sortedCurrent.every((value, index) => value === sortedPrefill[index]) &&
      sortedCurrentCustom.length === sortedPrefillCustom.length &&
      sortedCurrentCustom.every(
        (value, index) => value === sortedPrefillCustom[index],
      );

    if (
      prefill.completed &&
      sourcesUnchanged &&
      monthlyRange === prefill.range
    ) {
      goToNextStep();
      return;
    }

    const selectedSources = [
      ...primarySource
        .filter((val) => val !== CUSTOM_INCOME_SOURCE_VALUE)
        .map(
          (val) =>
            incomeSources.find((source) => source.value === val)?.label ?? val,
        ),
      ...(isCustomSelected ? customEntries : []),
    ];
    const selectedRange =
      incomeRanges.find((range) => range.value === monthlyRange)?.label ??
      monthlyRange;

    try {
      await updateOnboardingMutation.mutateAsync({
        step: setupInfo[2].key,
        data: { incomeSource: selectedSources, incomeRange: selectedRange },
      });

      goToNextStep();
    } catch (error) {
      const apiError = error as ApiError;
      Toast.show({
        type: "error",
        text1: apiError.message || "Something went wrong",
        text2: "Please try again.",
      });
    }
  };

  return (
    <SetupContainer className="bg-light">
      <View className="flex-1">
        <SetupHeader
          currentStep={2}
          totalSteps={5}
          title="Monthly Income"
          description="Help us personalize your budgeting experience"
        />

        <View className="flex-1 px-6 pb-6">
          <ScrollView
            className="mt-6 flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              family="degular"
              weight="semibold"
              className="mb-4 text-base text-textColor"
            >
              Income Sources
            </Text>
            <Text className="mb-3">
              You can select more than one income source
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {incomeSources.map((source) => {
                const isSelected = primarySource.includes(source.value);
                return (
                  <Pressable
                    key={source.value}
                    onPress={() => {
                      setPrimarySource((prev) =>
                        prev.includes(source.value)
                          ? prev.filter((value) => value !== source.value)
                          : [...prev, source.value],
                      );
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-3",
                      isSelected
                        ? "border-primary_400 bg-primary_100"
                        : "border-[#E2E8F0] bg-white",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        isSelected
                          ? "text-primary_500 font-nunitoBold"
                          : "text-textColor",
                      )}
                    >
                      {source.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {isCustomSelected && (
              <TextInputField
                containerClassName="mt-4"
                label="Custom income source"
                placeholder="e.g. Rental, Royalties (comma separated)"
                value={customSource}
                onChangeText={setCustomSource}
                autoCapitalize="words"
              />
            )}

            <Text
              family="degular"
              weight="semibold"
              className="mb-4 mt-8 text-base text-textColor"
            >
              Monthly Income Range
            </Text>
            <View className="gap-3">
              {incomeRanges.map((range) => {
                const isSelected = monthlyRange === range.value;
                return (
                  <Pressable
                    key={range.value}
                    onPress={() => setMonthlyRange(range.value)}
                    className={cn(
                      "flex-row items-center justify-between rounded-2xl border px-5 py-4",
                      isSelected
                        ? "border-primary_400 bg-primary_100"
                        : "border-[#E2E8F0] bg-white",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        isSelected
                          ? "text-primary_500 font-nunitoBold"
                          : "text-textColor",
                      )}
                    >
                      {range.label}
                    </Text>
                    {isSelected && (
                      <View className="bg-primary_500 h-5 w-5 items-center justify-center rounded-full">
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Text className="mt-8 text-xs leading-5 text-textColor/70">
              This information helps us suggest appropriate budgets and savings
              goals.
            </Text>
          </ScrollView>

          <View className="mt-auto flex-row gap-4 pt-10">
            <Button
              title="Previous"
              variant="outline"
              className="flex-1"
              onPress={handlePrevious}
            />
            <Button
              title="Next"
              className="flex-1"
              onPress={handleNext}
              disabled={
                ((!hasValidSelection || !monthlyRange) && !prefill.completed) ||
                updateOnboardingMutation.isPending
              }
              loading={updateOnboardingMutation.isPending}
            />
          </View>
        </View>
      </View>
    </SetupContainer>
  );
};

export default MonthlyIncomeScreen;
