import SetupContainer from "@/components/layouts/SetupContainer";
import SelectField from "@/components/setup/SelectField";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { useSession } from "@/contexts/auth-context/useSession";
import useSetUpStep from "@/hooks/useSetUpStep";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

const incomeSources = [
  { label: "Salary/Employment", value: "salary" },
  { label: "Business/Self-employed", value: "business" },
  { label: "Freelancing", value: "freelancing" },
  { label: "Multiple Sources", value: "multiple" },
  { label: "Student/No Income", value: "student" },
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
  const [primarySource, setPrimarySource] = useState<string | undefined>();
  const [monthlyRange, setMonthlyRange] = useState<string | undefined>();

  useSetUpStep(2);

  const handlePrevious = () => {
    setSetupStep(1);
    router.back();
  };
  const handleNext = () => {
    if (!primarySource || !monthlyRange) {
      return;
    }
    setSetupStep(3);
    router.navigate("/(auth)/setup/your-banks");
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
          <View className="mt-6">
            <SelectField
              label="Primary Income Source"
              value={primarySource}
              onSelect={setPrimarySource}
              options={incomeSources}
              className="mt-0"
            />
            <SelectField
              label="Monthly Income Range"
              value={monthlyRange}
              onSelect={setMonthlyRange}
              options={incomeRanges}
            />

            <Text className="mt-6 text-xs leading-5 text-textColor/70">
              This information helps us suggest appropriate budgets and savings
              goals. Your data is private and secure.
            </Text>
          </View>

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
              disabled={!primarySource || !monthlyRange}
            />
          </View>
        </View>
      </View>
    </SetupContainer>
  );
};

export default MonthlyIncomeScreen;
