import { cn } from "@/lib/utils";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

type ButtonVariant = "solid" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10",
  md: "h-12",
  lg: "h-16",
};

export default function Button({
  title,
  variant = "solid",
  size = "lg",
  loading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    "rounded-xl items-center justify-center flex-row active:opacity-80",
    sizes[size],
  );

  const variantStyles =
    variant === "solid"
      ? "bg-primary_400"
      : "border border-primary_400 bg-transparent active:bg-primary_400/10";

  const textStyles =
    variant === "solid"
      ? "text-white text-base font-nunitoMedium"
      : "text-primary_400  text-base font-nunitoMedium";

  const disabledStyles =
    variant === "solid" ? "bg-gray-300" : "border-gray-300 text-gray-300";

  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        baseStyles,
        isDisabled ? disabledStyles : variantStyles,
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "solid" ? "#ffffff" : "#0B48E4"}
        />
      ) : (
        <Text
          className={cn(
            textStyles,
            isDisabled && "text-gray-500",
            "text-center",
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
