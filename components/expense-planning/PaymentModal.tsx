import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { SharedValue } from "react-native-reanimated";

type PaymentModalProps = {
  isOpen: SharedValue<boolean>;
  onClose: () => void;
  paymentMethods: { label: string; value: string }[];
  selectedMethod: string;
  onSelect: (methodValue: string) => void;
  title?: string;
};

const PaymentModal = ({
  isOpen,
  onClose,
  paymentMethods,
  selectedMethod,
  onSelect,
  title = "Payment Method",
}: PaymentModalProps) => {
  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      headerBackgroundColor={COLORS.primary_400}
      headerTextColor="#fff"
      closeIconColor="#fff"
      className="px-0"
    >
      <View className="gap-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.value;
          return (
            <Pressable
              key={method.value}
              onPress={() => onSelect(method.value)}
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
                  {method.label}
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
};

export default PaymentModal;
