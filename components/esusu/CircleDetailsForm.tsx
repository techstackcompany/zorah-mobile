import AmountInput from "@/components/ui/AmountInput";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, TextInput, View } from "react-native";
import SelectField from "./SelectField";

type CircleDetailsFormProps = {
  // Form values
  groupName: string;
  contributionAmount: string;
  frequency: "daily" | "weekly" | "monthly";
  totalRounds: string;
  startDate: string;
  penaltyFee: string;
  pickerType: "rotation" | "manual" | "automatic";
  description: string;

  // Handlers
  onGroupNameChange: (value: string) => void;
  onContributionAmountChange: (value: string) => void;
  onFrequencyChange: (value: "daily" | "weekly" | "monthly") => void;
  onTotalRoundsChange: (value: string) => void;
  onStartDateChange: (formatted: string) => void;
  onPenaltyFeeChange: (value: string) => void;
  onPickerTypeChange: (value: "rotation" | "manual" | "automatic") => void;
  onDescriptionChange: (value: string) => void;

  // UI state
  focusedField: string | null;
  onFocusField: (field: string | null) => void;
  isFrequencyModalVisible: boolean;
  isPickerTypeModalVisible: boolean;
  onOpenFrequencyModal: () => void;
  onCloseFrequencyModal: () => void;
  onOpenPickerTypeModal: () => void;
  onClosePickerTypeModal: () => void;

  // Options
  frequencyOptions: readonly { label: string; value: string }[];
  pickerTypeOptions: readonly { label: string; value: string }[];
};

export default function CircleDetailsForm({
  groupName,
  contributionAmount,
  frequency,
  totalRounds,
  startDate,
  penaltyFee,
  pickerType,
  description,
  onGroupNameChange,
  onContributionAmountChange,
  onFrequencyChange,
  onTotalRoundsChange,
  onStartDateChange,
  onPenaltyFeeChange,
  onPickerTypeChange,
  onDescriptionChange,
  focusedField,
  onFocusField,
  isFrequencyModalVisible,
  isPickerTypeModalVisible,
  onOpenFrequencyModal,
  onCloseFrequencyModal,
  onOpenPickerTypeModal,
  onClosePickerTypeModal,
  frequencyOptions,
  pickerTypeOptions,
}: CircleDetailsFormProps) {
  return (
    <View className="px-6 pt-4">
      {/* Circle Details Section Header */}
      <View className="mb-6 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full">
          <Ionicons
            name="people-outline"
            size={24}
            color={COLORS.primary_400}
          />
        </View>
        <Text weight="semibold" className="text-lg text-textColor">
          Circle Details
        </Text>
      </View>

      {/* Group Name */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">Group Name</Text>
        <TextInput
          value={groupName}
          onChangeText={onGroupNameChange}
          placeholder="e.g., Family Contribution"
          placeholderTextColor="#9AA5B1"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-textColor"
        />
      </View>

      {/* Contribution Amount */}
      <View className="mb-4">
        <AmountInput
          value={contributionAmount}
          onChangeValue={onContributionAmountChange}
          label="Contribution Amount"
          labelCLassName="mb-2"
          containerClassName="border-gray-200"
          isFocused={focusedField === "contribution"}
          onFocus={() => onFocusField("contribution")}
          onBlur={() => onFocusField(null)}
        />
      </View>

      {/* Frequency */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">Frequency</Text>
        <SelectField
          label="Frequency"
          value={
            frequencyOptions.find((opt) => opt.value === frequency)?.label || ""
          }
          placeholder="Select frequency"
          isFocused={focusedField === "frequency"}
          isModalVisible={isFrequencyModalVisible}
          onPress={onOpenFrequencyModal}
        />
      </View>

      {/* Total Rounds */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">Total Rounds</Text>
        <TextInput
          value={totalRounds}
          onChangeText={onTotalRoundsChange}
          placeholder="2"
          placeholderTextColor="#9AA5B1"
          keyboardType="number-pad"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-textColor"
        />
      </View>

      {/* Start Date */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">Start Date</Text>
        <DatePickerField
          value={startDate}
          onChange={onStartDateChange}
          isFocused={focusedField === "startDate"}
          onFocusChange={(focused) =>
            onFocusField(focused ? "startDate" : null)
          }
          placeholder="DD/MM/YY"
          renderSelectIcon={() => (
            <Image
              source={require("@/assets/icons/calendar.svg")}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />
          )}
        />
      </View>

      {/* Group Image (Optional) */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">
          Group Image (Optional)
        </Text>
        <View className="flex-row gap-3">
          <Pressable className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <Text className="text-center text-base text-textColor">
              Upload Image
            </Text>
          </Pressable>
          <Pressable className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <Text className="text-center text-base text-textColor/50">
              Browse file
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Penalty Fee (Optional) */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">
          Penalty Fee (Optional)
        </Text>
        <TextInput
          value={penaltyFee}
          onChangeText={onPenaltyFeeChange}
          placeholder="0.00"
          placeholderTextColor="#9AA5B1"
          keyboardType="decimal-pad"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-textColor"
        />
      </View>

      {/* Picker Type */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">Picker Type</Text>
        <SelectField
          label="Picker Type"
          value={
            pickerTypeOptions.find((opt) => opt.value === pickerType)?.label ||
            ""
          }
          placeholder="Select picker type"
          isFocused={focusedField === "pickerType"}
          isModalVisible={isPickerTypeModalVisible}
          onPress={onOpenPickerTypeModal}
        />
      </View>

      {/* Description (Optional) */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-textColor/70">
          Description (Optional)
        </Text>
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Describe the purpose of this savings circle..."
          placeholderTextColor="#9AA5B1"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-textColor"
        />
      </View>

      {/* Frequency Modal */}
      <SlideUpModal
        visible={isFrequencyModalVisible}
        onClose={onCloseFrequencyModal}
        title="Frequency"
      >
        {frequencyOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => {
              onFrequencyChange(option.value as "daily" | "weekly" | "monthly");
              onCloseFrequencyModal();
            }}
            className={cn(
              "mb-3 rounded-xl px-4 py-4",
              frequency === option.value ? "bg-primary_100" : "bg-gray-50",
            )}
          >
            <Text
              className={cn(
                "text-base",
                frequency === option.value
                  ? "font-semibold text-primary_400"
                  : "text-textColor",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </SlideUpModal>

      {/* Picker Type Modal */}
      <SlideUpModal
        visible={isPickerTypeModalVisible}
        onClose={onClosePickerTypeModal}
        title="Picker Type"
      >
        {pickerTypeOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => {
              onPickerTypeChange(
                option.value as "rotation" | "manual" | "automatic",
              );
              onClosePickerTypeModal();
            }}
            className={cn(
              "mb-3 rounded-xl px-4 py-4",
              pickerType === option.value ? "bg-primary_100" : "bg-gray-50",
            )}
          >
            <Text
              className={cn(
                "text-base",
                pickerType === option.value
                  ? "font-semibold text-primary_400"
                  : "text-textColor",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </SlideUpModal>
    </View>
  );
}
