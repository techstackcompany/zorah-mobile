import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, View } from "react-native";

import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";

type SingleSelectModalProps = {
  onClose?: () => void;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string;
};

export type SingleSelectModalRef = SlideUpModalRef;

const SingleSelectModal = forwardRef<
  SingleSelectModalRef,
  SingleSelectModalProps
>(
  (
    { onClose, options, selectedValue, onSelect, title = "Payment Method" },
    ref,
  ) => {
    const modalRef = useRef<SlideUpModalRef>(null);

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
      isOpen: () => modalRef.current?.isOpen(),
    }));

    return (
      <SlideUpModal
        ref={modalRef}
        onClose={onClose}
        title={title}
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        className="px-0"
      >
        <View className="gap-2">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                className={cn(
                  "rounded-2xl px-4 py-3",
                  isSelected ? "bg-primary_100" : "bg-white",
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    weight="semibold"
                    className={cn(
                      "text-base capitalize text-textColor",
                      isSelected && "text-primary_400",
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
                </View>
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>
    );
  },
);

SingleSelectModal.displayName = "SingleSelectModal";

export default SingleSelectModal;
