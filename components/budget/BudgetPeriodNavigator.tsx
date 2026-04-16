import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";

type BudgetPeriodNavigatorProps = {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
};

const BudgetPeriodNavigator = ({
  label,
  onPrevious,
  onNext,
  disableNext,
  disablePrevious,
}: BudgetPeriodNavigatorProps) => {
  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        className={`h-10 w-10 items-center justify-center rounded-full ${disablePrevious ? "opacity-50" : ""}`}
        onPress={onPrevious}
        disabled={disablePrevious}
      >
        <Ionicons name="chevron-back" size={20} color={COLORS.textColor} />
      </Pressable>

      <Pressable className=" flex-row items-center gap-2">
        <Text weight="semibold" className="text-base text-textColor">
          {label}
        </Text>
        <Image
          source={require("@/assets/icons/calendar.svg")}
          style={{ width: 20, height: 20 }}
        />
      </Pressable>

      <Pressable
        className={`h-10 w-10 items-center justify-center rounded-full ${disableNext ? "opacity-25" : ""}`}
        onPress={onNext}
        disabled={disableNext}
      >
        <Ionicons name="chevron-forward" size={20} color={COLORS.textColor} />
      </Pressable>
    </View>
  );
};

export default BudgetPeriodNavigator;
