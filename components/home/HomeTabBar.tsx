import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Image, ImageSource } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_CONFIG: Record<string, { label: string; iconSource: ImageSource }> = {
  index: { label: "Home", iconSource: require("@/assets/icons/home.svg") },
  budget: { label: "Budget", iconSource: require("@/assets/icons/budget.svg") },
  "expense-planning": {
    label: "Expenses",
    iconSource: require("@/assets/icons/expense.svg"),
  },
  profile: {
    label: "Account",
    iconSource: require("@/assets/icons/profile.svg"),
  },
};

// Minimal motion: one quick ease-out slide, no spring physics.
const PILL_TIMING = { duration: 200, easing: Easing.out(Easing.cubic) };
const HIDE_DURATION = 220;
const ITEM_LAYOUT_TRANSITION = LinearTransition.duration(200).easing(
  Easing.out(Easing.cubic),
);

type TabLayout = { x: number; width: number };

type TabItemProps = {
  label: string;
  iconSource: ImageSource;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

const TabItem = ({
  label,
  iconSource,
  isFocused,
  onPress,
  onLongPress,
  onLayout,
}: TabItemProps) => {
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: 120 });
  }, [isFocused, focusProgress]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }));
  const inactiveIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusProgress.value,
  }));
  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
  }));

  return (
    <AnimatedPressable
      layout={ITEM_LAYOUT_TRANSITION}
      onLayout={onLayout}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 100 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 100 });
      }}
      style={{ minHeight: 48, minWidth: 48 }}
      className={cn(
        "mx-1 items-center justify-center rounded-full py-1",
        isFocused ? "min-w-[90px] px-4" : "px-3",
      )}
    >
      <Animated.View
        style={pressStyle}
        className="flex-row items-center justify-center"
      >
        {/* tintColor isn't animatable on expo-image, so crossfade two copies */}
        <View style={styles.iconStack}>
          <Animated.View style={inactiveIconStyle}>
            <Image
              source={iconSource}
              style={[styles.icon, { tintColor: "#FFFFFF" }]}
              contentFit="contain"
            />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, activeIconStyle]}>
            <Image
              source={iconSource}
              style={[styles.icon, { tintColor: COLORS.primary_400 }]}
              contentFit="contain"
            />
          </Animated.View>
        </View>
        {isFocused ? (
          <Animated.View
            entering={FadeIn.duration(120)}
            exiting={FadeOut.duration(80)}
          >
            <Text weight="semibold" className="ml-2 text-sm text-primary_400">
              {label}
            </Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </AnimatedPressable>
  );
};

type HomeTabBarProps = BottomTabBarProps & {
  /** Keeps the bar mounted and slides it out instead of unmounting. */
  hidden?: boolean;
};

const HomeTabBar = ({
  state,
  navigation,
  hidden = false,
}: HomeTabBarProps) => {
  const { bottom } = useSafeAreaInsets();

  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const pillOpacity = useSharedValue(0);
  const pillInitialized = useRef(false);

  const visibleRoutes = state.routes.filter(
    (route) => route.name !== "investment" && route.name !== "fxRates",
  );
  const focusedRoute = state.routes[state.index];
  const focusedIndex = visibleRoutes.findIndex(
    (route) => route.key === focusedRoute?.key,
  );
  const focusedKey =
    focusedIndex >= 0 ? (visibleRoutes[focusedIndex]?.key ?? null) : null;

  useEffect(() => {
    const layout = focusedKey ? layouts[focusedKey] : undefined;
    if (!layout) {
      // Hidden route focused (fxRates/investment) or not measured yet.
      pillOpacity.value = withTiming(0, { duration: 120  });
      return;
    }
    if (!pillInitialized.current) {
      // First position: place the pill without a fly-in from x=0.
      pillInitialized.current = true;
      pillX.value = layout.x;
      pillWidth.value = layout.width;
      pillOpacity.value = 1;
      return;
    }
    pillOpacity.value = withTiming(1, { duration: 120 });
    pillX.value = withTiming(layout.x, PILL_TIMING);
    pillWidth.value = withTiming(layout.width, PILL_TIMING);
  }, [focusedKey, layouts, pillOpacity, pillWidth, pillX]);

  const handleItemLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => {
      const existing = prev[key];
      if (
        existing &&
        Math.abs(existing.x - x) < 0.5 &&
        Math.abs(existing.width - width) < 0.5
      ) {
        return prev;
      }
      return { ...prev, [key]: { x, width } };
    });
  };

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    width: pillWidth.value,
    transform: [{ translateX: pillX.value }],
  }));

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: withTiming(hidden ? 0 : 1, { duration: HIDE_DURATION }),
    transform: [
      { translateY: withTiming(hidden ? 140 : 0, { duration: HIDE_DURATION }) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "box-none"}
      style={[
        styles.wrapper,
        { paddingBottom: bottom + 10, paddingTop: 0 },
        wrapperStyle,
      ]}
    >
      <View style={styles.container}>
        {/* Inner row has no padding so item onLayout coords match pill coords */}
        <View style={styles.itemsRow}>
          <Animated.View
            pointerEvents="none"
            style={[styles.pill, pillStyle]}
          />
          {visibleRoutes.map((route) => {
            const isFocused = route.key === focusedKey;
            const tabItem = TAB_CONFIG[route.name] ?? {
              label: route.name,
              iconSource: require("@/assets/icons/more.svg"),
            };

            const onPress = () => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                label={tabItem.label}
                iconSource={tabItem.iconSource}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                onLayout={(event) => handleItemLayout(route.key, event)}
              />
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

export default HomeTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.primary_400,
    borderRadius: 1000,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  itemsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 1000,
    backgroundColor: "#FFFFFF",
  },
  icon: {
    width: 22,
    height: 22,
  },
  iconStack: {
    width: 22,
    height: 22,
  },
});
