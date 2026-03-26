import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import React from "react";
import { View } from "react-native";

type SetupHeaderProps = {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  className?: string;
};

const SetupHeader = ({
  currentStep,
  totalSteps,
  title,
  description,
  className,
}: SetupHeaderProps) => {
  const progress = Math.min(
    100,
    Math.max(0, (currentStep / totalSteps) * 100 || 0),
  );

  return (
    <View className={cn("px-6 pb-2 pt-8", className)}>
      <Text weight="semibold" className="text-sm text-textColor">
        Step {currentStep} of {totalSteps}
      </Text>
      <View className="mt-3 h-1 rounded-full bg-white">
        <View
          className="h-full rounded-full bg-secondary_500"
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text
        family="degular"
        weight="semibold"
        className="mt-6 text-center text-2xl text-textColor"
      >
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm text-textColor/70">
        {description}
      </Text>
    </View>
  );
};

export default SetupHeader;
