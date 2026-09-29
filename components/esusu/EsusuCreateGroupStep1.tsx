import { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { CreateEsusuFormData } from "@/features/esusu/types";
import { formatAmountValue, sanitizeCentsInput } from "@/lib/amount";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { EsusuLabel } from "./EsusuLabel";
import { EsusuOptionSheet } from "./EsusuOptionSheet";
import { EsusuTextField } from "./EsusuTextField";

interface EsusuCreateGroupStep1Props {
  formData: CreateEsusuFormData;
  onChangeField: <K extends keyof CreateEsusuFormData>(
    key: K,
    value: CreateEsusuFormData[K],
  ) => void;
  onNext: () => void;
}

const FREQUENCY_OPTIONS: {
  id: CreateEsusuFormData["frequency"];
  label: string;
}[] = [
  { id: "Daily", label: "Daily" },
  { id: "Weekly", label: "Weekly" },
  { id: "Monthly", label: "Monthly" },
];

/*
const PICKER_OPTIONS: { id: PickerType; label: string }[] = [
  { id: "rotation", label: "Rotation Picker" },
  { id: "manual", label: "Manual Picker" },
  { id: "automatic", label: "Automatic Picker" },
];
*/

export const EsusuCreateGroupStep1 = ({
  formData,
  onChangeField,
  onNext,
}: EsusuCreateGroupStep1Props) => {
  // const pickerSheetRef = useRef<SlideUpModalRef>(null);
  const frequencySheetRef = useRef<SlideUpModalRef>(null);

  const handleAmountChange = (text: string) => {
    const sanitized = sanitizeCentsInput(text);
    onChangeField("contributionAmount", sanitized);
  };

  /*
  const handlePickMockImage = () => {
    // Mock image selection
    onChangeField(
      "groupImageUri",
      formData.groupImageUri ? undefined : "circle_cover.jpg",
    );
  };
  */

  const isFormValid =
    formData.groupName.trim().length > 0 &&
    Number(formData.contributionAmount) > 0;

  return (
    <View className="pb-6">
      {/* Section Header */}
      <View className="mb-4 flex-row items-center">
        <Ionicons name="people-outline" size={20} color={COLORS.primary_400} />
        <Text
          family="nunito"
          weight="bold"
          className="ml-2 text-base text-textColor"
        >
          Circle Details
        </Text>
      </View>

      {/* 1. Group Name */}
      <EsusuTextField
        label="Group Name"
        value={formData.groupName}
        onChangeText={(val) => onChangeField("groupName", val)}
        placeholder="e.g., Family Contribution"
      />

      {/* 2. Contribution Amount */}
      <View className="mb-4">
        <View className="rounded-xl border border-gray-200 bg-white p-4">
          <EsusuLabel>Contribution Amount</EsusuLabel>
          <TextInput
            value={
              formData.contributionAmount
                ? formatAmountValue(formData.contributionAmount, {
                    currencySymbol: "₦",
                    forceFixedDecimals: true,
                  })
                : ""
            }
            onChangeText={handleAmountChange}
            placeholder="₦ 0.00"
            placeholderTextColor="#848484"
            keyboardType="number-pad"
            style={{ includeFontPadding: false }}
            className="p-0 text-4xl font-bold text-textColor"
          />
        </View>
      </View>

      {/* 3. Frequency & Total Rounds */}
      <View className="mb-4 flex-row gap-3">
        {/* Frequency */}
        <View className="flex-1">
          <EsusuLabel>Frequency</EsusuLabel>
          <Pressable
            onPress={() => frequencySheetRef.current?.present()}
            className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-3.5 active:bg-gray-50"
            accessibilityRole="button"
            accessibilityLabel="Select frequency"
          >
            <Text
              family="nunito"
              weight="medium"
              className="text-sm text-textColor"
            >
              {formData.frequency}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textColor} />
          </Pressable>
        </View>

        {/* Total Rounds */}
        {/* <EsusuTextField
          label="Total Rounds"
          containerClassName="flex-1"
          value={formData.totalRounds}
          onChangeText={(val) => onChangeField("totalRounds", val)}
          placeholder="2"
          keyboardType="number-pad"
        /> */}
      </View>

      {/* 4. Start Date */}
      {/* <View className="mb-4">
        <EsusuLabel>Start Date</EsusuLabel>
        <DatePickerField
          value={formData.startDate}
          onChange={(formatted) => onChangeField("startDate", formatted)}
          placeholder="DD/MM/YY"
          renderSelectIcon={() => (
            <Image
              source={require("@/assets/icons/calendar.svg")}
              style={{ width: 20, height: 20 }}
            />
          )}
        />
      </View> */}

      {/* 5. Group Image (Optional) */}
      {/* <View className="mb-4">
        <EsusuLabel>Group Image (Optional)</EsusuLabel>
        <Pressable
          onPress={handlePickMockImage}
          className="flex-row items-center rounded-xl border border-gray-200 bg-white"
          accessibilityRole="button"
          accessibilityLabel="Upload Group Image"
        >
          <View className="border-r border-gray-200 bg-[#F9FAFB] px-4 py-3.5">
            <Text
              family="nunito"
              weight="semibold"
              className="text-sm text-textColor"
            >
              Upload Image
            </Text>
          </View>
          <Text
            family="nunito"
            weight="regular"
            className="flex-1 px-4 text-sm text-textColor/40"
            numberOfLines={1}
          >
            {formData.groupImageUri || "Browse file"}
          </Text>
        </Pressable>
      </View> */}

      {/* 6. Penalty Fee (Optional) */}
      {/* <EsusuTextField
        label="Penalty Fee (Optional)"
        value={formData.penaltyFee}
        onChangeText={(val) => onChangeField("penaltyFee", val)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      /> */}

      {/* 7. Picker Type */}
      {/* <View className="mb-4">
        <EsusuLabel>Picker Type</EsusuLabel>
        <Pressable
          onPress={() => pickerSheetRef.current?.present()}
          className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 active:bg-gray-50"
          accessibilityRole="button"
          accessibilityLabel="Select Picker Type"
        >
          <Text
            family="nunito"
            weight="medium"
            className="text-sm text-textColor"
          >
            {PICKER_OPTIONS.find((o) => o.id === formData.pickerType)?.label}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textColor} />
        </Pressable>
      </View> */}

      {/* 8. Description (Optional) */}
      {/* <EsusuTextField
        label="Description (Optional)"
        containerClassName="mb-6"
        value={formData.description}
        onChangeText={(val) => onChangeField("description", val)}
        placeholder="Describe the purpose of this savings circle..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={{ fontFamily: "NunitoRegular", minHeight: 100 }}
        className="p-4"
      /> */}

      {/* 9. Next Button */}
      <Pressable
        onPress={onNext}
        className={`items-center justify-center rounded-xl py-4 ${
          isFormValid ? "bg-primary_400 active:opacity-90" : "bg-[#EAF2FF]"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Go to Step 2"
      >
        <Text
          family="nunito"
          weight="semibold"
          className={`text-base ${isFormValid ? "text-white" : "text-primary_400"}`}
        >
          Next
        </Text>
      </Pressable>

      {/* Frequency Sheet */}
      <EsusuOptionSheet
        ref={frequencySheetRef}
        title="Frequency"
        options={FREQUENCY_OPTIONS}
        selectedId={formData.frequency}
        onSelect={(id) => {
          onChangeField("frequency", id);
          frequencySheetRef.current?.dismiss();
        }}
      />

      {/* Picker Type Sheet */}
      {/* <EsusuOptionSheet
        ref={pickerSheetRef}
        title="Picker Type"
        options={PICKER_OPTIONS}
        selectedId={formData.pickerType}
        onSelect={(id) => {
          onChangeField("pickerType", id);
          pickerSheetRef.current?.dismiss();
        }}
      /> */}
    </View>
  );
};
