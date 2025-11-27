import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";

type SelectButtonProps = {
  value?: string;
  placeholder?: string;
  onPress: () => void;
  isOpen?: boolean;
  isFocused?: boolean;
  className?: string;
};

const SelectButton = ({
  value,
  placeholder = "Select",
  onPress,
  isOpen = false,
  isFocused = false,
  className,
}: SelectButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
        isFocused ? "border-primary_400" : "border-gray-200",
        className,
      )}
    >
      <Text
        className={cn(
          "text-base",
          value ? "text-textColor" : "text-textColor/50",
        )}
      >
        {value || placeholder}
      </Text>

      <Ionicons
        name={isOpen ? "chevron-up" : "chevron-down"}
        size={20}
        color={COLORS.textColor}
      />
    </Pressable>
  );
};

export default SelectButton;
