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

const MonthlyIncomeScreen = () => {
  const userData = useUserData();
  const [primarySource, setPrimarySource] = useState<string[]>([]);
  const [isStandAloneSelected, setIsStandAloneSelected] = useState(false);
  const [monthlyRange, setMonthlyRange] = useState<string | undefined>();
  const updateOnboardingMutation = useUpdateOnboardingMutation();

  const { goToNextStep, goToPreviousStep } = useSetUpStep(2);

  useEffect(() => {
    // console.log("userData.onboarding", userData?.onboarding);
    // if(userData?.onboarding && userData.onboarding.)
  }, []);

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
                      setPrimarySource((prev) =>
                        prev.includes(source.value)
                          ? prev.filter((v) => v !== source.value)
                          : [...prev, source.value],
                      );
                      if (source.standAlone) {
                        setIsStandAloneSelected(true);
                        return;
                      }
                      setIsStandAloneSelected(false);
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
