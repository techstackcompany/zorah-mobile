import SetupContainer from "@/components/layouts/SetupContainer";
import SelectField from "@/components/setup/SelectField";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import useSetUpStep from "@/hooks/useSetUpStep";
import { ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { PermissionsAndroid, Platform, View } from "react-native";

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

const howItWorksPoints = [
  "We read your SMS bank alerts automatically",
  "No need to share login details or passwords",
  "Works completely offline for privacy",
  "You can add more banks later",
];

const MonthlyIncomeScreen = () => {
  const router = useRouter();
  const { setSetupStep } = useSession();
  const [primarySource, setPrimarySource] = useState<string | undefined>();
  const [monthlyRange, setMonthlyRange] = useState<string | undefined>();
  const [hasShownSmsModal, setHasShownSmsModal] = useState(false);
  const [isSmsModalVisible, setIsSmsModalVisible] = useState(false);

  useSetUpStep(2)

  const handlePrevious = () => {
    setSetupStep(1);
    router.back();
  };

  const handleNext = () => {
    if (!primarySource || !monthlyRange) {
      return;
    }
    if (!hasShownSmsModal) {
      setIsSmsModalVisible(true);
      return;
    }
    setSetupStep(3);
    router.navigate("/(auth)/setup/your-banks");
  };

  const handleAllowSmsAccess = async () => {
    setIsSmsModalVisible(false);
    setHasShownSmsModal(true);
    try {
      if (Platform.OS === "android") {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: "Allow SMS Access",
            message:
              "Zorah reads your bank SMS alerts to log expenses automatically. Please grant access.",
            buttonPositive: "Allow",
          },
        );
      }
    } catch (error) {
      console.warn("Failed to request SMS permission:", error);
    }
    setSetupStep(3);
    router.navigate("/(auth)/setup/your-banks");
  };

  const handleSkipSmsAccess = () => {
    setIsSmsModalVisible(false);
    setHasShownSmsModal(true);
    setSetupStep(3);
    router.navigate("/(auth)/setup/your-banks");
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

      <SlideUpModal
        visible={isSmsModalVisible}
        onClose={handleSkipSmsAccess}
        title="SMS Access"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        className="gap-5"
      >
        <View
          className="py-4"
       
        >
          <Text className="text-sm leading-5 text-textColor/80">
            Zorah helps you log expenses automatically by reading only
            bank transaction SMS alerts. We don&apos;t need your login details,
            and your data stays private on your device.
          </Text>
        </View>

        <ImageBackground
        source={require('@/assets/images/bg-patterns/fold-pattern.png')}
          className="rounded-2xl "
          style={{
           padding:20,
          borderRadius:16,
            backgroundColor: "#F1F5FF",
          }}
        >
          <Text
            family="degular"
            weight="semibold"
            className="text-xl text-textColor"
          >
            How it works:
          </Text>
          <View className="mt-4">
            {howItWorksPoints.map((point) => (
              <View key={point} className="mb-4 flex-row items-start">
                <View className="mt-1.5 h-2 w-2 rounded-full bg-textColor/90" />
                <Text className="ml-3 flex-1 text-sm leading-5 text-textColor/80">
                  {point}
                </Text>
              </View>
            ))}
          </View>
        </ImageBackground>

        <Button title="Allow SMS Access" onPress={handleAllowSmsAccess} />
        <Button
          title="Not Now"
          variant="outline"
          onPress={handleSkipSmsAccess}
        />
      </SlideUpModal>
    </SetupContainer>
  );
};

export default MonthlyIncomeScreen;
