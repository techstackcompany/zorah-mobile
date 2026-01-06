import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type SlideUpModalProps = {
  isOpen: SharedValue<boolean>;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  closeIconColor?: string;
  height?: DimensionValue | undefined;
  className?: string;
  duration?: number;
};

const SlideUpModal = ({
  isOpen,
  title,
  onClose,
  children,
  headerBackgroundColor = COLORS.primary_400,
  headerTextColor = "#222",
  closeIconColor,
  height = "auto",
  className,
  duration = 300,
}: SlideUpModalProps) => {
  const contentHeight = useSharedValue(0);

  // Derived value for animation progress (1 = closed, 0 = open)
  const progress = useDerivedValue(() =>
    withTiming(isOpen.value ? 0 : 1, { duration }),
  );

  // Backdrop opacity animation
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    zIndex: isOpen.value
      ? 1
      : withDelay(duration, withTiming(-1, { duration: 0 })),
    pointerEvents: isOpen.value ? "auto" : "none",
  }));

  // Modal slide animation
  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 2 * contentHeight.value }],
    zIndex: isOpen.value
      ? 2
      : withDelay(duration, withTiming(-1, { duration: 0 })),
    pointerEvents: isOpen.value ? "auto" : "none",
  }));

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View
        onLayout={(e) => {
          contentHeight.value = e.nativeEvent.layout.height;
        }}
        style={[styles.modal, { height }, modalStyle]}
      >
        {title && (
          <View
            style={[styles.header, { backgroundColor: headerBackgroundColor }]}
          >
            <Text style={[styles.title, { color: headerTextColor }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={20}>
              <Ionicons
                name="close"
                size={22}
                color={closeIconColor ?? headerTextColor}
              />
            </TouchableOpacity>
          </View>
        )}

        <View className={cn("px-6 py-4", className)}>{children}</View>
      </Animated.View>
    </>
  );
};

export default SlideUpModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdropPressable: {
    flex: 1,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontFamily: "NunitoMedium",
  },
});
