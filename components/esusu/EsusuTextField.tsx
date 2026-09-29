import { EsusuLabel } from "./EsusuLabel";
import React from "react";
import { TextInput, TextInputProps, View } from "react-native";

interface EsusuTextFieldProps extends TextInputProps {
  label: string;
  containerClassName?: string;
}

export const EsusuTextField = ({
  label,
  containerClassName = "mb-4",
  className,
  style,
  ...props
}: EsusuTextFieldProps) => {
  return (
    <View className={containerClassName}>
      <EsusuLabel>{label}</EsusuLabel>
      <TextInput
        placeholderTextColor="#9CA3AF"
        style={[
          { fontFamily: "NunitoMedium", includeFontPadding: false },
          style,
        ]}
        className={`rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-textColor ${className || ""}`}
        {...props}
      />
    </View>
  );
};
