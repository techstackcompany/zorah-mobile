import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import { FX_CONVERTER_OPTIONS } from "@/constants/fx";
import { Image } from "expo-image";
import { SelectionDot } from "./SelectionDot";

export type CurrencySelectModalProps = {
  visible: boolean;
  type: "from" | "to";
  onClose: () => void;
  onSelect: (code: string) => void;
  activeFrom: string;
  activeTo: string;
};

const CurrencySelectModal = ({ visible, type, onClose, onSelect, activeFrom, activeTo }: CurrencySelectModalProps) => {
  return (
    <SlideUpModal
      visible={visible}
      onClose={onClose}
      title="Select Currency"
      headerBackgroundColor="#1643F5"
      headerTextColor="#FFFFFF"
    >
      <View className="space-y-2">
        {FX_CONVERTER_OPTIONS.map((option) => {
          const isSelected = (type === "from" ? activeFrom : activeTo) === option.code;
          const optionFlag = option.flag;
          return (
            <Pressable
              key={option.code}
              style={styles.modalRow}
              accessibilityRole="button"
              onPress={() => {
                onSelect(option.code);
                onClose();
              }}
            >
              {optionFlag ? (
                <Image source={optionFlag} style={styles.modalFlag} contentFit="cover" />
              ) : null}
              <View style={styles.modalText}>
                <Text weight="semibold" className="text-sm text-textColor">
                  {option.code}
                </Text>
                <Text className="text-xs text-textColor/60">{option.name}</Text>
              </View>
              <SelectionDot selected={isSelected} />
            </Pressable>
          );
        })}
      </View>
    </SlideUpModal>
  );
};

const styles = StyleSheet.create({
  modalRow: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalFlag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  modalText: {
    flex: 1,
  },
});

export default CurrencySelectModal;
