import { cn } from "@/lib/utils";
import { CategoryItem } from "@/src/api/types";
import { Image } from "expo-image";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import Text from "./Text";

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
  const renderItem = ({ item: category }: { item: CategoryItem<K> }) => {
    const isActive = category.key === selectedKey;
    return (
      <Pressable
        onPress={() => onSelect(category.key)}
        className={cn(
          "aspect-square w-[96px] items-center justify-center gap-2 rounded-xl border px-2 py-2",
          isActive
            ? "border-primary_400 bg-primary_200"
            : "border-gray-200 bg-white",
        )}
        accessibilityRole="button"
      >
        <View className="items-center justify-center rounded-full">
          <Image
            source={
              typeof category.icon === "string"
                ? { uri: category.icon }
                : category.icon
            }
            style={{ width: 24, height: 24 }}
            contentFit="contain"
          />
        </View>
        <Text
          weight="bold"
          className="text-center text-xs leading-tight text-textColor"
        >
          {category.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className={cn("mt-3", className)}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />
    </View>
  );
};

export type { CategorySelectorProps };
export default CategorySelector;
