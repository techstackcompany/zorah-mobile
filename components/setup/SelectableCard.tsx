import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import React from "react";
import { Pressable, PressableProps, View } from "react-native";

type SelectableCardProps = PressableProps & {
  title: string;
  subtitle?: string;
  selected?: boolean;
};

const SelectableCard = ({
  title,
  subtitle,
  selected = false,
  className,
  ...props
}: SelectableCardProps) => {
  return (
    <Pressable
      {...props}
      className={cn(
        "mt-4 flex-row items-center justify-between rounded-2xl  px-5 py-4",
        selected ? " bg-primary_100" : "bg-white",
        className,
      )}
    >
      <View className="flex-1 pr-5">
        <Text weight="semibold" className="text-lg text-textColor">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-textColor/70">{subtitle}</Text>
        ) : null}
      </View>
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-full border-2",
          selected ? "border-primary_400" : "border-grey",
        )}
      >
        {
          <View
            className={cn(
              "bg-grey h-3 w-3 rounded-full",
              selected && "bg-primary_400",
            )}
          />
        }
      </View>
    </Pressable>
  );
};

export default SelectableCard;
