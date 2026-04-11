import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { incomeRanges, incomeSources, setupInfo } from "@/constants/setup";
import useUserData from "@/contexts/auth-context/useUserData";
import useSetUpStep from "@/hooks/useSetUpStep";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/src/api/client";
import { useUpdateOnboardingMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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

const isStandAloneSource = (value: string) =>
  incomeSources.some((source) => source.value === value && source.standAlone);

const MonthlyIncomeScreen = () => {
  const userData = useUserData();
  const [primarySource, setPrimarySource] = useState<string[]>([]);
  const [isStandAloneSelected, setIsStandAloneSelected] = useState(false);
  const [monthlyRange, setMonthlyRange] = useState<string | undefined>();
  const updateOnboardingMutation = useUpdateOnboardingMutation();

  const { goToNextStep, goToPreviousStep } = useSetUpStep(2);

  useEffect(() => {
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

    const prefilledSources = Array.from(
      new Set(
        normalizeStringList(rawIncomeSource)
          .map(normalizeIncomeSourceValue)
          .filter((entry): entry is string => Boolean(entry)),
      ),
    );

    const resolvedSources = prefilledSources.some(isStandAloneSource)
      ? prefilledSources.filter(isStandAloneSource).slice(0, 1)
      : prefilledSources;

    const prefilledRange =
      typeof rawIncomeRange === "string"
        ? normalizeIncomeRangeValue(rawIncomeRange)
        : undefined;

    setPrimarySource((prev) => (prev.length > 0 ? prev : resolvedSources));
    setIsStandAloneSelected(
      (prev) => prev || resolvedSources.some(isStandAloneSource),
    );
    setMonthlyRange((prev) => prev ?? prefilledRange);
  }, [userData]);

  const handlePrevious = () => {
    goToPreviousStep();
  };

  const handleNext = async () => {
    if (primarySource.length === 0 || !monthlyRange) {
      return;
    }

    const selectedSources = primarySource.map(
      (val) =>
        incomeSources.find((source) => source.value === val)?.label ?? val,
    );
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
          totalSteps={4}
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
                    disabled={isStandAloneSelected && !isSelected}
                    onPress={() => {
                      setPrimarySource((prev) => {
                        const currentlySelected = prev.includes(source.value);
                        let next: string[];

                        if (source.standAlone) {
                          next = currentlySelected ? [] : [source.value];
                        } else {
                          const withoutStandAlone = prev.filter(
                            (value) => !isStandAloneSource(value),
                          );
                          next = currentlySelected
                            ? withoutStandAlone.filter(
                                (value) => value !== source.value,
                              )
                            : [...withoutStandAlone, source.value];
                        }

                        setIsStandAloneSelected(
                          next.some((value) => isStandAloneSource(value)),
                        );
                        return next;
                      });
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
                primarySource.length === 0 ||
                !monthlyRange ||
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
