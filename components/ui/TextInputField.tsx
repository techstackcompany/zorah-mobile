import React, { useCallback, useState } from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TargetedEvent,
  TextInputProps,
  View,
} from "react-native";

import { cn } from "@/lib/utils";

import Text from "./Text";

export type TextInputFieldProps = {
  label?: string;
  containerClassName?: string;
  inputClassName?: string;
  onFocusChange?: (focused: boolean) => void;
} & TextInputProps;

const TextInputField = ({
  label,
  containerClassName,
  inputClassName,
  onFocusChange,
  onFocus,
  onBlur,
  className,
  ...rest
}: TextInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocused(true);
      onFocusChange?.(true);
      onFocus?.(event);
    },
    [onFocus, onFocusChange],
  );

  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocused(false);
      onFocusChange?.(false);
      onBlur?.(event);
    },
    [onBlur, onFocusChange],
  );

  return (
    <View className={containerClassName}>
      {label ? (
        <Text className="text-sm text-textColor/70">{label}</Text>
      ) : null}
      <TextInput
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "mt-2 rounded-2xl border bg-white px-4 py-4 font-nunitoMedium text-base",
          isFocused ? "border-primary_400" : "border-gray-200",
          className,
          inputClassName,
        )}
        {...rest}
      />
    </View>
  );
};

export default TextInputField;
