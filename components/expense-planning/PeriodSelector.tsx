import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { PeriodType } from "@/features/expense-income/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, View } from "react-native";


type PeriodSelectorProps = {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
};

const PERIOD_OPTIONS:{ value: PeriodType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "daily", label: "Daily", icon: "calendar-outline" },
  { value: "monthly", label: "Monthly", icon: "calendar-number-outline" },
];

const PeriodSelector = ({
  selectedPeriod,
  onPeriodChange,
}: PeriodSelectorProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = PERIOD_OPTIONS.find(
    (opt) => opt.value === selectedPeriod,
  ) || PERIOD_OPTIONS[0];

  const handleSelect = (period: PeriodType) => {
    onPeriodChange(period);
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center gap-2 rounded-lg border border-grayLight/80 bg-white px-3 py-1.5"
        accessibilityRole="button"
        accessibilityLabel={`Select period. Current: ${selectedOption.label}`}
      >
        <Ionicons
          name={selectedOption.icon}
          size={16}
          color={COLORS.textColor}
        />
        <Text weight="semibold" className="text-xs text-textColor">
          {selectedOption.label}
        </Text>
        <Ionicons
          name="chevron-down-outline"
          size={14}
          color={COLORS.textColor}
        />
      </Pressable>

      <SlideUpModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Select Period"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        className="gap-2"
      >
        {PERIOD_OPTIONS.map((option) => {
          const isSelected = option.value === selectedPeriod;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${isSelected ? "bg-primary_100" : "bg-white"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? COLORS.primary_400 : COLORS.textColor}
                />
                <Text
                  weight={isSelected ? "semibold" : "medium"}
                  className={`text-sm ${isSelected ? "text-primary_400" : "text-textColor"}`}
                >
                  {option.label}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.primary_400}
                />
              )}
            </Pressable>
          );
        })}
      </SlideUpModal>
    </>
  );
};

export default PeriodSelector;

