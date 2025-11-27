import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  View,
} from "react-native";

import { cn } from "@/lib/utils";

import Text from "./Text";

type PrimaryButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  ref?: React.Ref<View>;
};

const PrimaryButton = ({
  label,
  loading = false,
  loadingLabel,
  className,
  disabled,
  ref,
  ...props
}: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      ref={ref}
      className={cn(
        "items-center justify-center rounded-2xl py-4",
        isDisabled ? "bg-primary_400/60" : "bg-primary_400",
        className,
      )}
      disabled={isDisabled}
      android_ripple={{ color: "rgba(255,255,255,0.25)" }}
      {...props}
    >
      <Text
        weight="semibold"
        className={cn("text-base text-white", loading && "opacity-0")}
      >
        {loading ? (loadingLabel ?? label) : label}
      </Text>
      {loading && <ActivityIndicator color="#fff" className="absolute" />}
    </Pressable>
  );
};

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
