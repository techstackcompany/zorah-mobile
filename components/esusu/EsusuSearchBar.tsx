import { Image } from "expo-image";
import React from "react";
import { TextInput, View } from "react-native";

interface EsusuSearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

export const EsusuSearchBar = ({
  searchQuery,
  onSearchChange,
}: EsusuSearchBarProps) => {
  return (
    <View className="mt-3.5 flex-row items-center rounded-xl border border-gray-200 bg-white px-3.5 py-2.5">
      <Image
        source={require("@/assets/icons/search.svg")}
        style={{ width: 20, height: 20 }}
        contentFit="contain"
      />
      <TextInput
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search circle contribution..."
        placeholderTextColor="#848484"
        style={{
          fontFamily: "NunitoMedium",
          includeFontPadding: false,
        }}
        className="ml-2.5 flex-1 p-0 text-base text-textColor"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};
