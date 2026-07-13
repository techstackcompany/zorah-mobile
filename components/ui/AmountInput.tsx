import React, { useMemo, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  formatAmountValue,
  sanitizeAmountInput,
  sanitizeCentsInput,
} from "@/lib/amount";
import { cn } from "@/lib/utils";

type AmountInputProps = Omit<TextInputProps, "value" | "onChangeText"> & {
  value: string;
  onChangeValue: (value: string) => void;
  containerClassName?: string;
  inputWrapperClassName?: string;
  label?: string;
  isFocused?: boolean;
  currencySymbol?: string;
  forceFixedDecimalsOnBlur?: boolean;
  labelCLassName?: string;
  /** Cash-register entry (default): digits fill the decimals from the
   * right ("5" → 0.05, "500" → 5.00) so no decimal key is needed.
   * Pass false to type amounts with an explicit decimal point. */
  autoDecimal?: boolean;
};

const AmountInput = React.forwardRef<TextInput, AmountInputProps>(
  (
    {
      containerClassName,
      inputWrapperClassName,
      label = "Amount",
      className,
      isFocused,
      value,
      onChangeValue,
      currencySymbol = "₦",
      forceFixedDecimalsOnBlur = true,
      keyboardType,
      placeholder = "₦ 0.00",
      labelCLassName,
      autoDecimal = true,
      ...rest
    },
    ref,
  ) => {
    const [internalFocused, setInternalFocused] = useState(false);
    const { onFocus, onBlur, ...inputProps } = rest;

    const handleFocus = (event: any) => {
      setInternalFocused(true);
      onFocus?.(event as any);
    };

    const handleBlur = (event: any) => {
      setInternalFocused(false);
      onBlur?.(event as any);
    };

    const resolvedFocused =
      typeof isFocused === "boolean" ? isFocused : internalFocused;
    const displayValue = useMemo(() => {
      if (!value) {
        return "";
      }

      return formatAmountValue(value, {
        // Cash-register entry always shows both decimal places.
        forceFixedDecimals:
          autoDecimal || (forceFixedDecimalsOnBlur && !resolvedFocused),
        currencySymbol,
      });
    }, [
      autoDecimal,
      currencySymbol,
      forceFixedDecimalsOnBlur,
      resolvedFocused,
      value,
    ]);

    const handleChangeText = (text: string) => {
      const sanitized = autoDecimal
        ? sanitizeCentsInput(text)
        : sanitizeAmountInput(text);
      onChangeValue(sanitized);
    };

    return (
      <View
        className={cn(
          "rounded-2xl border bg-white px-4 py-4",
          resolvedFocused ? "border-primary_400" : "border-gray-200",
          containerClassName,
        )}
      >
        <Text className={cn("mb-3 text-sm text-textColor/70", labelCLassName)}>
          {label}
        </Text>
        <View className={cn("", inputWrapperClassName)}>
          <TextInput
            ref={ref}
            keyboardType={
              keyboardType ?? (autoDecimal ? "number-pad" : "decimal-pad")
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value ? displayValue : ""}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textColor + "80"}
            className={cn(
              "py-0 text-4xl font-semibold text-textColor",
              className,
            )}
            {...inputProps}
          />
        </View>
      </View>
    );
  },
);

AmountInput.displayName = "AmountInput";

export default AmountInput;
export { formatAmountValue, sanitizeAmountInput };
