import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";

export interface EsusuOptionSheetOption<T extends string> {
  id: T;
  label: string;
}

interface EsusuOptionSheetProps<T extends string> {
  title: string;
  options: EsusuOptionSheetOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
}

function EsusuOptionSheetInner<T extends string>(
  { title, options, selectedId, onSelect }: EsusuOptionSheetProps<T>,
  ref: React.Ref<SlideUpModalRef>,
) {
  return (
    <SlideUpModal
      ref={ref}
      title={title}
      headerTextColor="#FFFFFF"

      className="px-0 py-0"
    >
      <View>
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              className={cn(
                "flex-row items-center justify-between px-5 py-4 active:bg-gray-50",
              )}
              accessibilityRole="button"
              accessibilityLabel={option.label}
            >
              <Text
                family="nunito"
                weight={isSelected ? "bold" : "medium"}
                className={cn(
                  "text-base",
                  isSelected ? "text-primary_400" : "text-textColor",
                )}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={COLORS.primary_400}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </SlideUpModal>
  );
}

export const EsusuOptionSheet = forwardRef(EsusuOptionSheetInner) as <
  T extends string,
>(
  props: EsusuOptionSheetProps<T> & { ref?: React.Ref<SlideUpModalRef> },
) => ReturnType<typeof EsusuOptionSheetInner>;
