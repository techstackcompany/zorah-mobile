import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { PeriodOption } from "@/features/expense-income/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

type PeriodSelectorProps = {
  selectedOption: PeriodOption;
  onPress: () => void;
};

const PeriodSelector = ({ selectedOption, onPress }: PeriodSelectorProps) => {
  return (
    <>
      <Pressable
        onPress={onPress}
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
    </>
  );
};

export default PeriodSelector;
