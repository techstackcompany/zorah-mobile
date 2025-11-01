import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useEffect, useState } from "react";
import {
  DimensionValue,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type SlideUpModalProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  closeIconColor?: string;
  height?: DimensionValue | undefined;
  className?: string;
};

const SlideUpModal = ({
  visible,
  title,
  onClose,
  children,
  headerBackgroundColor = COLORS.primary_400,
  headerTextColor = "#222",
  closeIconColor,
  height = "auto",
  className,
}: SlideUpModalProps) => {
  // Shared animation values
  const [show, setShow] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(400);

  useEffect(() => {
    if (visible) {
      setShow(visible);
      overlayOpacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(400, { duration: 300 });
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  // Animated styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={show}
      transparent
      animationType="none" // we handle animations manually
      onRequestClose={onClose}
      statusBarTranslucent
      allowSwipeDismissal
      navigationBarTranslucent
    >
      {/* Overlay with fade animation */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet modal with slide animation */}
      <Animated.View style={[styles.modal, { height }, modalStyle]}>
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
    </Modal>
  );
};

export default SlideUpModal;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
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
