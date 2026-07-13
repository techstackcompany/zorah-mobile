import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

type WelcomeHeaderProps = {
  initials: string;
  welcomeName: string;
  currentDate: string;
  unreadNotificationCount?: number;
  onNotificationPress?: () => void;
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  initials,
  welcomeName,
  currentDate,
  unreadNotificationCount = 0,
  onNotificationPress,
}) => {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between px-6">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => router.push("/profile")} className="h-12 w-12 items-center justify-center rounded-full bg-primary_100">
          <Text weight="semibold" className="text-lg text-primary_400">
            {initials}
          </Text>
        </Pressable>
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
        className="relative h-14 w-14 items-center justify-center rounded-full bg-white"
        onPress={onNotificationPress}
      >
        <Ionicons name="notifications-outline" size={24} color={"#000"} />
        {unreadNotificationCount > 0 && (
          <Animated.View
            entering={ZoomIn.springify().damping(14).stiffness(220)}
            exiting={ZoomOut.duration(120)}
            className="absolute right-3 top-3 h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1"
          >
            <Text weight="bold" className="text-[10px] text-white">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </Text>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
};

export default WelcomeHeader;

