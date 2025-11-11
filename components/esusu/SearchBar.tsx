import { Image } from "expo-image";
import { TextInput, View } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search circle contribution...",
}: SearchBarProps) {
  return (
    <View className="mt-5 rounded-xl border border-[#E9EDF3] bg-white px-4 ">
      <View className="flex-row items-center">
        <Image
          source={require("@/assets/icons/search.svg")}
          style={{
            alignSelf: "center",
            height: 24,
            width: 24,
          }}
          contentFit="contain"
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9EA3B5"
          className="ml-3 flex-1 py-4 font-nunitoMedium text-lg text-textColor"
          returnKeyType="search"
        />
      </View>
    </View>
  );
}
