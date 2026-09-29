import { Image } from "expo-image";
import React from "react";
import { Pressable, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onMicPress: () => void;
  onFilterPress: () => void;
};

export const DebtSearchBar = ({
  value,
  onChangeText,
  onMicPress,
  onFilterPress,
}: Props) => {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      {/* Search field */}
      <View className="flex-1 flex-row items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <Image
          source={require("@/assets/icons/search.svg")}
          style={{ width: 20, height: 20 }}
          contentFit="contain"
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search name..."
          placeholderTextColor="#9CA3AF"
          style={{ fontFamily: "NunitoMedium", includeFontPadding: false }}
          className="ml-2 flex-1 p-0 text-base text-textColor"
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {/* Filter button */}
      <Pressable
        onPress={onFilterPress}
        className="items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5"
        hitSlop={4}
        accessibilityLabel="Open filters"
      >
        <Image
          source={require("@/assets/icons/filter.svg")}
          style={{ width: 20, height: 20 }}
          contentFit="contain"
        />
      </Pressable>
    </View>
  );
};
