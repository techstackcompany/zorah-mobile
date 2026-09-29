import Text from "@/components/ui/Text";
import React from "react";
import { View } from "react-native";

interface EsusuCreateStepIndicatorProps {
  step: 1 | 2;
}

export const EsusuCreateStepIndicator = ({
  step,
}: EsusuCreateStepIndicatorProps) => {
  const stepTitle = step === 1 ? "Circle Details" : "Add Members";
  const progressPercent = step === 1 ? "50%" : "100%";

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between">
        <Text
          family="nunito"
          weight="medium"
          className="text-sm text-textColor/70"
        >
          {stepTitle}
        </Text>
        <Text
          family="nunito"
          weight="medium"
          className="text-sm text-textColor/70"
        >
          Step {step} of 2
        </Text>
      </View>

      <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <View
          style={{ width: progressPercent }}
          className="h-full rounded-full bg-secondary_500"
        />
      </View>
    </View>
  );
};
