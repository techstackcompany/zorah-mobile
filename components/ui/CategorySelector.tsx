import { cn } from "@/lib/utils";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import Text from "./Text";

type CategoryItem<K extends string> = {
  key: K;
  label: string;
  icon: ImageSource;
};

type CategorySelectorProps<K extends string> = {
  categories: readonly CategoryItem<K>[];
  selectedKey: K;
  onSelect: (key: K) => void;
  className?: string;
};

const CategorySelector = <K extends string>({
  categories,
  selectedKey,
  onSelect,
  className,
}: CategorySelectorProps<K>) => {
  return (
    <View
      className={cn(
        "mt-3 flex-row justify-between gap-2 sm:gap-3",
        className,
      )}
    >
      {categories.map((category) => {
        const isActive = category.key === selectedKey;
        return (
          <Pressable
            key={category.key}
            onPress={() => onSelect(category.key)}
            className={cn(
              "aspect-square flex-1 items-center justify-center gap-2 rounded-xl border py-2",
              isActive
                ? "border-primary_400 bg-primary_200"
                : "border-gray-200 bg-white",
            )}
            accessibilityRole="button"
          >
            <View className="items-center justify-center rounded-full">
              <Image
                source={category.icon}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </View>
            <Text
              weight="bold"
              className="text-center text-sm leading-tight text-textColor"
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export type { CategoryItem, CategorySelectorProps };
export default CategorySelector;
