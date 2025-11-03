import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

type HeaderProps = {
  title: string;
  onBack?: () => void;
};

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <View className="flex-row items-center px-6 pt-[58px] pb-6 bg-white">
      <Pressable
        onPress={onBack}
        hitSlop={10}
        className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-transparent"
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.tertiary} />
      </Pressable>
      <Text family="nunito" weight="semibold" className="text-lg text-tertiary">
        {title}
      </Text>
    </View>
  );
};

export default Header;
