import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { PeriodOption } from "@/features/expense-income/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Share } from "react-native";
import { SharedValue, } from "react-native-reanimated";

type PeriodSelectorProps = {
  selectedOption: PeriodOption;
  isModalOpen :SharedValue<boolean>;
};

const PeriodSelector = ({ selectedOption,isModalOpen }: PeriodSelectorProps) => {

  return (
    <>
      <Pressable
        onPress={() => (isModalOpen.value = true)}
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
