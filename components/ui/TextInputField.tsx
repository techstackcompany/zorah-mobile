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
  error?: string;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  onFocusChange?: (focused: boolean) => void;
} & TextInputProps;

const TextInputField = ({
  label,
  error,
  rightElement,
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
      <View
        className={cn(
          "mt-2 flex-row items-center rounded-2xl border bg-white px-4",
          isFocused ? "border-primary_400" : "border-gray-200",
          error ? "border-red-500" : "",
          className,
        )}
      >
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "flex-1 py-4 font-nunitoMedium text-base text-textColor",
            inputClassName,
          )}
          {...rest}
        />
        {rightElement}
      </View>
      {error ? (
        <Text className="mt-1 text-sm text-red-500">{error}</Text>
      ) : null}
    </View>
  );
};

export default TextInputField;
