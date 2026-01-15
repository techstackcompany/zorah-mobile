import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, View } from "react-native";

type CurrencyOption = {
  code: string;
  label: string;
  symbol: string;
  flag: ImageSource;
};

type CurrencySelectorModalProps = {
  currencies: CurrencyOption[];
  selectedCurrency: CurrencyOption;
  onClose?: () => void;
  onSelect: (currency: CurrencyOption) => void;
};

export type CurrencySelectorModalRef = SlideUpModalRef;

const CurrencySelectorModal = forwardRef<
  CurrencySelectorModalRef,
  CurrencySelectorModalProps
>(({ currencies, selectedCurrency, onClose, onSelect }, ref) => {
  const modalRef = useRef<SlideUpModalRef>(null);

  useImperativeHandle(ref, () => ({
    present: () => modalRef.current?.present(),
    dismiss: () => modalRef.current?.dismiss(),
  }));

  return (
    <SlideUpModal
      ref={modalRef}
      onClose={onClose}
      title="Currency"
      headerBackgroundColor={COLORS.primary_400}
      headerTextColor="#fff"
      closeIconColor="#fff"
      className="pt-4"
      snapPoints={["60%"]}
    >
      <View className="gap-3">
        {currencies.map((option) => {
          const isSelected = option.code === selectedCurrency.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => onSelect(option)}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Image
                  source={option.flag}
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                  contentFit="cover"
                />
                <Text>{option.label}</Text>
              </View>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={isSelected ? COLORS.primary_400 : COLORS.grey}
              />
            </Pressable>
          );
        })}
      </View>
    </SlideUpModal>
  );
});

CurrencySelectorModal.displayName = "CurrencySelectorModal";

export default CurrencySelectorModal;
