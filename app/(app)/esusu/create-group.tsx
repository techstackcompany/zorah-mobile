import BottomNavigation from "@/components/esusu/BottomNavigation";
import CircleDetailsForm from "@/components/esusu/CircleDetailsForm";
import ProgressIndicator from "@/components/esusu/ProgressIndicator";
import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack } from "expo-router";
import React, { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
] as const;

const PICKER_TYPE_OPTIONS = [
  { label: "Rotation Picker", value: "rotation" },
  { label: "Manual Picker", value: "manual" },
  { label: "Automatic Picker", value: "automatic" },
] as const;

const STEP_TITLES: Record<number, string> = {
  1: "Circle Details",
  2: "Add Members",
};

export default function CreateEsusuGroupScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const headerHeight = useHeaderHeight();

  // Step 1: Circle Details
  const [groupName, setGroupName] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    "monthly",
  );
  const [totalRounds, setTotalRounds] = useState("2");
  const [startDate, setStartDate] = useState("");
  const [penaltyFee, setPenaltyFee] = useState("0.00");
  const [pickerType, setPickerType] = useState<
    "rotation" | "manual" | "automatic"
  >("rotation");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isFrequencyModalVisible, setIsFrequencyModalVisible] = useState(false);
  const [isPickerTypeModalVisible, setIsPickerTypeModalVisible] =
    useState(false);

  const handleNext = useCallback(() => {
    if (step === 1) {
      setStep(2);
    }
  }, [step]);

  const handlePrevious = useCallback(() => {
    if (step === 2) {
      setStep(1);
    }
  }, [step]);

  const openFrequencyModal = useCallback(() => {
    setIsFrequencyModalVisible(true);
    setFocusedField("frequency");
  }, []);

  const closeFrequencyModal = useCallback(() => {
    setIsFrequencyModalVisible(false);
    setFocusedField(null);
  }, []);

  const openPickerTypeModal = useCallback(() => {
    setIsPickerTypeModalVisible(true);
    setFocusedField("pickerType");
  }, []);

  const closePickerTypeModal = useCallback(() => {
    setIsPickerTypeModalVisible(false);
    setFocusedField(null);
  }, []);

  const isStep1Valid = useCallback(() => {
    return (
      groupName.trim() !== "" &&
      contributionAmount !== "" &&
      totalRounds !== "" &&
      startDate !== ""
    );
  }, [groupName, contributionAmount, totalRounds, startDate]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Create New Esusu Group",
          headerTitleStyle: { fontFamily: "NunitoSemibold", fontSize: 18 },
        }}
      />
      <MainContainer edges={[]} className="bg-lightMuted">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={headerHeight + 10}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <ProgressIndicator
              currentStep={step}
              totalSteps={2}
              stepTitle={STEP_TITLES[step]}
            />

            {step === 1 && (
              <CircleDetailsForm
                groupName={groupName}
                contributionAmount={contributionAmount}
                frequency={frequency}
                totalRounds={totalRounds}
                startDate={startDate}
                penaltyFee={penaltyFee}
                pickerType={pickerType}
                description={description}
                onGroupNameChange={setGroupName}
                onContributionAmountChange={setContributionAmount}
                onFrequencyChange={setFrequency}
                onTotalRoundsChange={setTotalRounds}
                onStartDateChange={setStartDate}
                onPenaltyFeeChange={setPenaltyFee}
                onPickerTypeChange={setPickerType}
                onDescriptionChange={setDescription}
                focusedField={focusedField}
                onFocusField={setFocusedField}
                isFrequencyModalVisible={isFrequencyModalVisible}
                isPickerTypeModalVisible={isPickerTypeModalVisible}
                onOpenFrequencyModal={openFrequencyModal}
                onCloseFrequencyModal={closeFrequencyModal}
                onOpenPickerTypeModal={openPickerTypeModal}
                onClosePickerTypeModal={closePickerTypeModal}
                frequencyOptions={FREQUENCY_OPTIONS}
                pickerTypeOptions={PICKER_TYPE_OPTIONS}
              />
            )}

            {step === 2 && (
              <View className="px-6 pt-6">
                <Text className="text-center text-lg font-semibold text-textColor">
                  Add Members (Coming Soon)
                </Text>
                <Text className="mt-2 text-center text-sm text-textColor/70">
                  This step will be implemented next
                </Text>
              </View>
            )}
          </ScrollView>

          </KeyboardAvoidingView>
          <BottomNavigation
            step={step}
            totalSteps={2}
            onPrevious={step > 1 ? handlePrevious : undefined}
            onNext={handleNext}
            isNextDisabled={step === 1 && !isStep1Valid()}
          />
      </MainContainer>
    </>
  );
}
