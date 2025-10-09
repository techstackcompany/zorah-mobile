import { cn } from "@/lib/utils";
import React from "react";
import { Pressable, PressableProps, Text } from "react-native";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "solid" | "outline";
};

export default function Button({
  title,
  variant = "solid",
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-xl py-4 active:opacity-80 items-center justify-center";

  const variantStyles =
    variant === "solid"
      ? "bg-primary"
      : "border border-primary bg-transparent";

  const textStyles =
    variant === "solid"
      ? "text-white font-semibold text-base"
      : "text-primary font-semibold text-base";

  return (
    <Pressable className={cn(baseStyles, variantStyles, className)} {...props}>
      <Text className={textStyles}>{title}</Text>
    </Pressable>
  );
}
