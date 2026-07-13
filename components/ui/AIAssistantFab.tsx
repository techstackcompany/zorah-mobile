import COLORS from "@/constants/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AIAssistantFabProps = {
  /** Distance above the bottom safe-area inset. Raise it on screens with their own floating button. */
  bottomOffset?: number;
  /** Fades and shrinks the FAB out (paired with the tab bar hiding). */
  hidden?: boolean;
};

const AIAssistantFab = ({
  bottomOffset = 90,
  hidden = false,
}: AIAssistantFabProps) => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const tilt = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    
    tilt.value = withRepeat(
      withSequence(
        withDelay(4200, withTiming(-7, { duration: 140 })),
        withTiming(7, { duration: 260 }),
        withTiming(-4, { duration: 220 }),
        withTiming(0, { duration: 180, easing: Easing.out(Easing.ease) }),
      ),
      -1,
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(tilt);
    };
  }, [scale, tilt]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${tilt.value}deg` }],
  }));

  const hiddenStyle = useAnimatedStyle(() => ({
    opacity: withTiming(hidden ? 0 : 1, { duration: 200 }),
    transform: [{ scale: withTiming(hidden ? 0.5 : 1, { duration: 200 }) }],
  }));

  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "auto"}
      className="absolute right-6"
      style={[{ bottom: bottom + bottomOffset }, hiddenStyle]}
    >
      <Pressable
        onPress={() => router.push("/(app)/ai-assistant")}
        accessibilityRole="button"
        accessibilityLabel="Open AI Assistant"
        className="h-14 w-14 items-center justify-center rounded-full bg-primary_400"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <Animated.View style={iconStyle}>
          <Image
            source={require("@/assets/icons/ai_bot.svg")}
            style={{ width: 28, height: 28 }}
            contentFit="contain"
            tintColor={COLORS.white}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export { AIAssistantFab };
