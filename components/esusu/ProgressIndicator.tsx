import Text from "@/components/ui/Text";
import { View } from "react-native";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
};

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepTitle,
}: ProgressIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View className="px-6 pt-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text weight="semibold" className="text-base text-textColor">
          {stepTitle}
        </Text>
        <Text className="text-sm text-textColor/70">
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <View
          className="h-full rounded-full bg-secondary_500"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );
}
