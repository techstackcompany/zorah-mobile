import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
] as const;

const DOT_PULSE_MS = 320;
const DOT_STAGGER_MS = 110;

type PinKeypadProps = {
  value: string;
  onChange: (next: string) => void;
  length: number;
  disabled?: boolean;
};

const PinKeypad = ({
  value,
  onChange,
  length,
  disabled = false,
}: PinKeypadProps) => {
  const tapFeedback = useCallback(() => {
    void Haptics.selectionAsync().catch(() => {});
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      if (disabled || value.length >= length) return;
      tapFeedback();
      onChange(value + digit);
    },
    [disabled, value, length, onChange, tapFeedback],
  );

  const handleBackspace = useCallback(() => {
    if (disabled || value.length === 0) return;
    tapFeedback();
    onChange(value.slice(0, -1));
  }, [disabled, value, onChange, tapFeedback]);

  const renderKey = (digit: string) => (
    <Pressable
      key={digit}
      onPress={() => handleDigit(digit)}
      disabled={disabled || value.length >= length}
      accessibilityRole="button"
      accessibilityLabel={digit}
      style={[styles.key, disabled && styles.keyDisabled]}
      android_ripple={{ color: COLORS.primary_200, borderless: true }}
    >
      <Text weight="semibold" style={styles.keyLabel}>
        {digit}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {ROWS.map((row) => (
        <View key={row.join()} style={styles.row}>
          {row.map(renderKey)}
        </View>
      ))}

      <View style={styles.row}>
        <View style={styles.blankKey} />
        {renderKey("0")}

        {value.length > 0 ? (
          <Pressable
            onPress={handleBackspace}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Delete"
            style={styles.blankKey}
          >
            <MaterialCommunityIcons
              name="backspace-outline"
              size={26}
              color={COLORS.textColor}
            />
          </Pressable>
        ) : (
          <View style={styles.blankKey} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  key: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F6FA",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  blankKey: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  keyLabel: {
    fontSize: 26,
    lineHeight: 32,
    color: COLORS.textColor,
  },
 
  keyDisabled: {
    opacity: 0.4,
  },
});

export default PinKeypad;


const Dot = ({
  filled,
  filledColor,
  emptyColor,
  pending,
  index,
}: {
  filled: boolean;
  filledColor: string;
  emptyColor: string;
  pending: boolean;
  index: number;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!pending) {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 150 });
      return;
    }
    progress.value = withDelay(
      index * DOT_STAGGER_MS,
      withRepeat(
        withSequence(
          withTiming(1, { duration: DOT_PULSE_MS }),
          withTiming(0, { duration: DOT_PULSE_MS }),
        ),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
  }, [pending, index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.6 }],
    opacity: 0.4 + progress.value * 0.6,
  }));

  return (
    <Animated.View
      style={[
        dotStyles.dot,
        {
          backgroundColor: filled || pending ? filledColor : "transparent",
          borderColor: filled || pending ? filledColor : emptyColor,
        },
        pending && animatedStyle,
      ]}
    />
  );
};

export const PinDots = ({
  value,
  length,
  filledColor = COLORS.primary_400,
  emptyColor = "#CBD5E1",
  pending = false,
}: {
  value: string;
  length: number;
  filledColor?: string;
  emptyColor?: string;
  /** Pulse the dots in sequence instead of showing entry progress. */
  pending?: boolean;
}) => (
  <View style={dotStyles.row}>
    {Array.from({ length }).map((_, index) => (
      <Dot
        key={index}
        index={index}
        filled={index < value.length}
        filledColor={filledColor}
        emptyColor={emptyColor}
        pending={pending}
      />
    ))}
  </View>
);

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
});
