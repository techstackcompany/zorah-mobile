import React, { useMemo, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

const sanitizeAmountInput = (input: string): string => {
  const cleaned = input.replace(/[^0-9.]/g, "");

  if (!cleaned) {
    return "";
  }

  const hasTrailingDot = cleaned.endsWith(".");
  const [integerPartRaw = "", ...fractionParts] = cleaned.split(".");
  let integerPart = integerPartRaw.replace(/^0+(?=\d)/, "");

  if (integerPart === "" && integerPartRaw !== "") {
    integerPart = "0";
  }

  let fractionPart = fractionParts.join("");
  if (fractionPart.length > 2) {
    fractionPart = fractionPart.slice(0, 2);
  }

  if (!integerPart && !fractionPart && !hasTrailingDot) {
    return "";
  }

  let normalized = integerPart;

  if (!normalized && (fractionPart || hasTrailingDot)) {
    normalized = "0";
  }

  if (fractionPart) {
    normalized = `${normalized}.${fractionPart}`;
  } else if (hasTrailingDot) {
    normalized = `${normalized}.`;
  }

  return normalized;
};

type FormatAmountOptions = {
  forceFixedDecimals?: boolean;
  currencySymbol?: string;
};

const formatAmountValue = (
  rawValue: string,
  {
    forceFixedDecimals = false,
    currencySymbol = "₦",
  }: FormatAmountOptions = {},
): string => {
  if (!rawValue) {
    return "";
  }

  const hasTrailingDot =
    !forceFixedDecimals && rawValue.endsWith(".") && !rawValue.includes("..");
  const [integerPartRaw = "", decimalPartRaw = ""] = rawValue.split(".");
  const integerPartForParsing =
    integerPartRaw && integerPartRaw !== "." ? integerPartRaw : "0";

  const integerNumber = Number(integerPartForParsing);
  const formattedInteger = integerNumber.toLocaleString("en-NG");

  const currencyPrefix = currencySymbol.endsWith(" ")
    ? currencySymbol
    : `${currencySymbol} `;

  if (hasTrailingDot && !decimalPartRaw) {
    return `${currencyPrefix}${formattedInteger}.`;
  }

  if (decimalPartRaw) {
    const limitedDecimals = decimalPartRaw.slice(0, 2);
    const decimals = forceFixedDecimals
      ? limitedDecimals.padEnd(2, "0")
      : limitedDecimals;
    return `${currencyPrefix}${formattedInteger}.${decimals}`;
  }

  if (forceFixedDecimals) {
    return `${currencyPrefix}${formattedInteger}.00`;
  }

  return `${currencyPrefix}${formattedInteger}`;
};

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
        forceFixedDecimals: forceFixedDecimalsOnBlur && !resolvedFocused,
        currencySymbol,
      });
    }, [currencySymbol, forceFixedDecimalsOnBlur, resolvedFocused, value]);

    const handleChangeText = (text: string) => {
      const sanitized = sanitizeAmountInput(text);
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
        <Text className={cn("mb-3 text-sm text-textColor/70 ", labelCLassName)}>
          {label}
        </Text>
        <View className={cn("", inputWrapperClassName)}>
          <TextInput
            ref={ref}
            keyboardType={keyboardType ?? "decimal-pad"}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value ? displayValue : ""}
            onChangeText={handleChangeText}
            placeholder={placeholder}
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
