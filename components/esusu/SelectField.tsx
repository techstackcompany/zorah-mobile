import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  isFocused?: boolean;
  isModalVisible?: boolean;
  onPress: () => void;
};

export default function SelectField({
  label,
  value,
  placeholder = "Select option",
  isFocused = false,
  isModalVisible = false,
  onPress,
}: SelectFieldProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
        isFocused ? "border-primary_400" : "border-gray-200",
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
        name={isModalVisible ? "chevron-up" : "chevron-down"}
        size={20}
        color={COLORS.textColor}
      />
    </Pressable>
  );
}
