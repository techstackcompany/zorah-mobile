import { capitalizeWord, cn } from "@/lib/utils";
import { CategoryItem } from "@/src/api/types";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, FlatList, Pressable, View } from "react-native";
import Text from "./Text";

type CategorySelectorProps<K extends string> = {
  categories: readonly CategoryItem<K>[];
  selectedKey: K;
  onSelect: (key: K) => void;
  className?: string;
  isLoading?: boolean;
};

const SkeletonItem = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className="aspect-square w-[96px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-2 py-2"
    >
      <View className="h-6 w-6 rounded-full bg-gray-200" />
      <View className="h-3 w-14 rounded bg-gray-200" />
    </Animated.View>
  );
};

const CategorySelector = <K extends string>({
  categories,
  selectedKey,
  onSelect,
  className,
  isLoading,
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
          {capitalizeWord(category.label)}
        </Text>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View className={cn("mt-3", className)}>
        <View className="flex-row gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonItem key={i} delay={i * 150} />
          ))}
        </View>
      </View>
    );
  }

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
