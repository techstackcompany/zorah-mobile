import COLORS from "@/constants/colors";
import { useBiometricSupport } from "@/hooks/useBiometricSupport";
import { verifyPin } from "@/lib/pinStorage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Text from "@/components/ui/Text";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CODE_FIELDS = 4;
const OFFSET = 20;
const TIME = 80;

type LockScreenProps = {
  visible?: boolean;
  onUnlock?: () => void;
  variant?: "screen" | "modal";
};

const LockScreen = ({
  visible = true,
  onUnlock,
  variant = "screen",
}: LockScreenProps) => {
  const [code, setCode] = useState<number[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState(false);
  const biometricAttempted = useRef(false);

  const {
    isAvailable: biometricsAvailable,
    supportsFaceId,
    supportsFingerprint,
    checking,
  } = useBiometricSupport();

  const biometricIcon =
    Platform.OS === "android" || supportsFingerprint
      ? "fingerprint"
      : supportsFaceId
        ? "face-recognition"
        : "lock";

  const codeLength = Array(CODE_FIELDS).fill(null);
  const offset = useSharedValue(0);

  const shakeAndReset = useCallback(() => {
    offset.value = withSequence(
      withTiming(-OFFSET, { duration: TIME / 20 }),
      withRepeat(withTiming(OFFSET, { duration: TIME / 2 }), 4, true),
      withTiming(0, { duration: TIME / 2 }),
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [offset]);

  // Reset state when lock hides so the next session starts clean.
  useEffect(() => {
    if (!visible) {
      biometricAttempted.current = false;
      setCode([]);
      setIsVerifying(false);
      setPinError(false);
    }
  }, [visible]);

  const handleUnlockSuccess = useCallback(() => {
    setCode([]);
    setIsVerifying(false);
    setPinError(false);
    onUnlock?.();
  }, [onUnlock]);

  // Auto-trigger biometric once per lock session. Guards against calling
  // authenticateAsync before availability is confirmed (checking === false)
  // and against re-triggering when handleUnlockSuccess reference changes.
  useEffect(() => {
    if (!visible || checking || !biometricsAvailable || biometricAttempted.current) {
      return;
    }
    biometricAttempted.current = true;

    const attempt = async () => {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Zorah",
        disableDeviceFallback: false,
      });
      if (success) {
        handleUnlockSuccess();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };
    attempt();
  }, [visible, checking, biometricsAvailable, handleUnlockSuccess]);

  // Verify PIN locally once 4 digits are entered. No network call.
  useEffect(() => {
    if (code.length !== CODE_FIELDS || isVerifying) return;

    setIsVerifying(true);
    verifyPin(code.join("")).then((isCorrect) => {
      if (isCorrect) {
        handleUnlockSuccess();
      } else {
        setIsVerifying(false);
        setCode([]);
        setPinError(true);
        shakeAndReset();
        Toast.show({
          type: "error",
          text1: "Incorrect PIN",
          text2: "Please try again.",
        });
      }
    });
  }, [code, isVerifying, handleUnlockSuccess, shakeAndReset]);

  const onNumberPress = (number: number) => {
    if (code.length < CODE_FIELDS && !isVerifying) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPinError(false);
      setCode((prev) => [...prev, number]);
    }
  };

  const onBackSpacePress = () => {
    if (code.length > 0 && !isVerifying) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode(code.slice(0, -1));
    }
  };

  const onBiometricPress = async () => {
    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Zorah",
      disableDeviceFallback: false,
    });
    if (success) {
      handleUnlockSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  if (!visible) return null;

  const content = (
    <LinearGradient colors={["#F6FAFF", "#FFFFFF"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.appIcon}
              contentFit="contain"
            />
          </View>
          <Text
            family="degular"
            weight="bold"
            className="text-[28px] text-textColor tracking-[0.5px] mb-2"
          >
            Welcome back
          </Text>
          <Text weight="regular" className="text-[15px] text-[#6B7280]">
            Enter your PIN to continue
          </Text>
        </View>

        <Animated.View style={[styles.codeView, style]}>
          {codeLength.map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeEmpty,
                {
                  backgroundColor:
                    index < code.length
                      ? pinError
                        ? COLORS.error
                        : COLORS.primary_400
                      : "transparent",
                  borderColor:
                    index < code.length
                      ? pinError
                        ? COLORS.error
                        : COLORS.primary_400
                      : COLORS.primary_200,
                  borderWidth: index < code.length ? 0 : 2,
                  opacity: isVerifying ? 0 : 1,
                },
              ]}
            />
          ))}
          {isVerifying && (
            <View style={styles.verifyingOverlay}>
              <ActivityIndicator size="small" color={COLORS.primary_400} />
            </View>
          )}
        </Animated.View>

        <View style={styles.numbersView}>
          {[0, 1, 2].map((rowIndex) => {
            const base = rowIndex * 3 + 1;
            return (
              <View
                key={rowIndex}
                style={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                {[base, base + 1, base + 2].map((number) => (
                  <TouchableOpacity
                    key={number}
                    style={[styles.keypadBtn, styles.numberBtn]}
                    onPress={() => onNumberPress(number)}
                  >
                    <Text weight="semibold" className="text-[28px] text-textColor">
                      {number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              disabled={!biometricsAvailable}
              onPress={biometricsAvailable ? onBiometricPress : undefined}
              style={[
                styles.keypadBtn,
                styles.biometricBtn,
                !biometricsAvailable && styles.disabledKeypad,
              ]}
            >
              <MaterialCommunityIcons
                name={biometricIcon}
                size={28}
                color={biometricsAvailable ? COLORS.primary_400 : COLORS.grey}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNumberPress(0)}
              style={[styles.keypadBtn, styles.numberBtn]}
            >
              <Text weight="semibold" className="text-[28px] text-textColor">
                0
              </Text>
            </TouchableOpacity>
            <View style={styles.keypadBtn}>
              {code.length > 0 && (
                <TouchableOpacity
                  style={[styles.keypadBtn, styles.backspaceBtn]}
                  onPress={onBackSpacePress}
                >
                  <MaterialCommunityIcons
                    name="backspace"
                    size={22}
                    color={COLORS.textColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  if (variant === "modal") {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: COLORS.primary_400,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appIcon: { width: 60, height: 60 },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 60,
    paddingHorizontal: 20,
    position: "relative",
  },
  verifyingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  codeEmpty: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  numbersView: { marginHorizontal: 40, gap: 24, marginTop: 20 },
  keypadBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  numberBtn: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biometricBtn: {
    backgroundColor: COLORS.primary_200,
    borderWidth: 1,
    borderColor: COLORS.primary_200,
  },
  backspaceBtn: { backgroundColor: "transparent" },
  disabledKeypad: { opacity: 0.4 },
});

export default LockScreen;