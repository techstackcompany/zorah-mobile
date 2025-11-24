import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

type WelcomeHeaderProps = {
  initials: string;
  welcomeName: string;
  currentDate: string;
  onNotificationPress?: () => void;
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  initials,
  welcomeName,
  currentDate,
  onNotificationPress,
}) => {
  return (
    <View className="flex-row items-center justify-between px-6">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary_100">
          <Text weight="semibold" className="text-lg text-primary_400">
            {initials}
          </Text>
        </View>
        <View>
          <Text weight="semibold" className="text-lg">
            Welcome {welcomeName}! <Text>👋</Text>
          </Text>
          <Text weight="medium" className="text-sm text-textColor/60">
            {currentDate}
          </Text>
        </View>
      </View>
      <Pressable
        className="h-14 w-14 items-center justify-center rounded-full bg-white"
        onPress={onNotificationPress}
      >
        <Ionicons name="notifications-outline" size={24} color={"#000"} />
      </Pressable>
    </View>
  );
};

export default WelcomeHeader;

