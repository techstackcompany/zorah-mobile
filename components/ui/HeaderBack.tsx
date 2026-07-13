import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

// Matches the iOS 26 native nav-bar liquid-glass back button so JS headers
// (tabs) look identical to native-stack headers.
const BUTTON_SIZE = 40;
const ICON_SIZE = 22;

type HeaderBackProps = {
  tintColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const HeaderBack = ({
  tintColor = COLORS.textColor,
  onPress,
  style,
}: HeaderBackProps = {}) => {
  const router = useRouter();

  const handlePress =
    onPress ??
    (() =>
      router.canGoBack() ? router.back() : router.replace("/(app)/(home)"));

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={style}
    >
      <GlassView
        style={[
          styles.circle,
          // Older iOS / Android: GlassView renders a plain view, so give it
          // a translucent fill that reads the same way.
          !isLiquidGlassAvailable() && styles.fallback,
        ]}
        glassEffectStyle="regular"
        isInteractive
      >
        <Ionicons name="chevron-back" size={ICON_SIZE} color={tintColor} />
      </GlassView>
    </Pressable>
  );
};

export const headerWithBack = {
  headerLeft: () => <HeaderBack />,
};

const styles = StyleSheet.create({
  circle: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
});
