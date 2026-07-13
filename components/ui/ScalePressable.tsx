import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 20, stiffness: 400 };

type ScalePressableProps = Omit<PressableProps, "style"> & {
  /** Scale while pressed. Use values closer to 1 for large surfaces. */
  scaleTo?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const ScalePressable = ({
  scaleTo = 0.96,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ScalePressableProps) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, scaleTo]) }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    pressed.value = withSpring(1, SPRING_CONFIG);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    pressed.value = withSpring(0, SPRING_CONFIG);
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  );
};

export { ScalePressable };
