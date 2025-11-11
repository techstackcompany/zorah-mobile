import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

type BottomNavigationProps = {
  step: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  previousLabel?: string;
};

export default function BottomNavigation({
  step,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  nextLabel = "Next",
  previousLabel = "Previous",
}: BottomNavigationProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 pb-8 pt-4">
      <View className="flex-row gap-3">
        {step > 1 && onPrevious && (
          <Pressable
            onPress={onPrevious}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-4"
          >
            <Text className="text-center text-base font-semibold text-textColor">
              {previousLabel}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={onNext}
          disabled={isNextDisabled}
          className={cn(
            "flex-1 rounded-2xl py-4",
            isNextDisabled ? "bg-gray-200" : "bg-primary_400",
          )}
        >
          <Text className="text-center text-base font-semibold text-white">
            {nextLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
