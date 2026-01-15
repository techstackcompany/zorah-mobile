import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, View } from "react-native";

import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";

type PaymentModalProps = {
  onClose?: () => void;
  paymentMethods: { label: string; value: string }[];
  selectedMethod: string;
  onSelect: (methodValue: string) => void;
  title?: string;
};

export type PaymentModalRef = SlideUpModalRef;

const PaymentModal = forwardRef<PaymentModalRef, PaymentModalProps>(
  (
    {
      onClose,
      paymentMethods,
      selectedMethod,
      onSelect,
      title = "Payment Method",
    },
    ref,
  ) => {
    const modalRef = useRef<SlideUpModalRef>(null);

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
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
  },
);

PaymentModal.displayName = "PaymentModal";

export default PaymentModal;
