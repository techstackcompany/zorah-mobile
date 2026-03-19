import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { useSession } from "@/contexts/auth-context/useSession";
import { setLocalSetupFlag } from "@/hooks/useSetupProgress";
import useSetUpStep from "@/hooks/useSetUpStep";
import { cn } from "@/lib/utils";
import { useUpdateOnboardingMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const incomeSources = [
  { label: "Salary/Employment", value: "salary" },
  { label: "Business/Self-employed", value: "business" },
  { label: "Freelancing", value: "freelancing" },
  { label: "Multiple Sources", value: "multiple" },
  { label: "Student/No Income", value: "student", standAlone: true },
];

const incomeRanges = [
  { label: "Below NGN 50,000", value: "below-50000" },
  { label: "NGN 50,000 - NGN 150,000", value: "50000-150000" },
  { label: "NGN 150,000 - NGN 300,000", value: "150000-300000" },
  { label: "NGN 300,000 - NGN 500,000", value: "300000-500000" },
  { label: "Above NGN 500,000", value: "above-500000" },
];

const MonthlyIncomeScreen = () => {
  const router = useRouter();
  const { setSetupStep } = useSession();
  const [primarySource, setPrimarySource] = useState<string[]>([]);
  const [isStandAloneSelected, setIsStandAloneSelected] = useState(false);
  const [monthlyRange, setMonthlyRange] = useState<string | undefined>();
  const updateOnboardingMutation = useUpdateOnboardingMutation();

  useSetUpStep(2);

  const handlePrevious = () => {
    setSetupStep(1);
    router.back();
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
        incomeSource: selectedSources,
        incomeRange: selectedRange,
      });

      await setLocalSetupFlag("income", true);

      setSetupStep(3);
      router.push("/(app)/setup/kyc");
    } catch (error) {
      // Handle error if needed
      console.error("Failed to update income:", error);
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
            <Text>You can select more than one income source</Text>
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
              goals. Your data is private and secure.
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
