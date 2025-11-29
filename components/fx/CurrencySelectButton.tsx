import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Image, ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Text from "@/components/ui/Text";

export type CurrencySelectButtonProps = {
  code: string;
  flag?: ImageSource;
  onPress: () => void;
};

const CurrencySelectButton = ({ code, flag, onPress }: CurrencySelectButtonProps) => {
  return (
    <Pressable style={styles.currencySelect} onPress={onPress} accessibilityRole="button">
      {flag ? <Image source={flag} style={styles.currencySelectFlag} contentFit="cover" /> : null}
      <Text weight="semibold" className="text-sm text-textColor">
        {code}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#9AA5B1" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  currencySelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 12,
    backgroundColor: "#EEF1F6",
    position: "absolute",
    right: 8,
    top: 8,
  },
  currencySelectFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});

export default CurrencySelectButton;
