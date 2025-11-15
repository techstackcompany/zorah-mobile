import COLORS from "@/constants/colors";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import { useVerifyUserPinMutation } from "@/src/api/hooks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
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
type BiometricSupport = {
  hasHardware: boolean;
  supportsFaceId: boolean;
  supportsFingerprint: boolean;
  isEnrolled: boolean;
  checking: boolean;
  isAvailable: boolean;
};

const useDeviceBiometricSupport = (): BiometricSupport => {
  const [support, setSupport] = useState({
    hasHardware: false,
    supportsFaceId: false,
    supportsFingerprint: false,
    isEnrolled: false,
    checking: true,
  });

  useEffect(() => {
    let active = true;

    const checkSupport = async () => {
      try {
        const [hasHardware, supportedTypes, isEnrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);

        if (!active) {
          return;
        }

        setSupport({
          hasHardware,
          supportsFaceId: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          ),
          supportsFingerprint: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT,
          ),
          isEnrolled,
          checking: false,
        });
      } catch {
        if (active) {
          setSupport((prev) => ({ ...prev, checking: false }));
        }
      }
    };

    checkSupport();

    return () => {
      active = false;
    };
  }, []);

  return {
    ...support,
    isAvailable: !support.checking && support.hasHardware && support.isEnrolled,
  };
};

const LockScreen = () => {
  const [code, setCode] = useState<number[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const { settings } = useAppSettings();
  const router = useRouter();

  const {
    isAvailable: biometricsAvailable,
    supportsFaceId,
    supportsFingerprint,
  } = useDeviceBiometricSupport();

  // Prevent navigation away from lock screen until verified
  useFocusEffect(
    useCallback(() => {
      // Check if we should be on lock screen
      const checkLockState = async () => {
        const wasInBackground = await AsyncStorage.getItem(
          "userInactivity:wasInBackground",
        );
        // If biometrics are enabled and app was in background, ensure we stay on lock screen
        if (settings.enableBiometrics && wasInBackground === "true") {
          // Force stay on lock screen
          return;
        }
        // If biometrics are disabled, navigate away
        if (!settings.enableBiometrics) {
          router.replace("/(app)/(home)");
        }
      };
      checkLockState();
    }, [settings.enableBiometrics, router]),
  );

  // Show fingerprint icon if Android OR if fingerprint is the primary method
  const biometricIcon =
    Platform.OS === "android" || supportsFingerprint
      ? "fingerprint"
      : supportsFaceId
        ? "face-recognition"
        : "lock";
  const codeLength = Array(CODE_FIELDS).fill(null);
  const offset = useSharedValue(0);

  const verifyPinMutation = useVerifyUserPinMutation({
    onSuccess: async () => {
      // Clear the background flag when PIN is verified
      await AsyncStorage.setItem("userInactivity:wasInBackground", "false");
      setIsVerifying(false);
      // Navigate to home
      router.replace("/(app)/(home)");
    },
    onError: (error) => {
      setIsVerifying(false);
      offset.value = withSequence(
        withTiming(-OFFSET, { duration: TIME / 20 }),
        withRepeat(withTiming(OFFSET, { duration: TIME / 2 }), 4, true),
        withTiming(0, { duration: TIME / 2 }),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Invalid PIN",
        text2: error.message || "Please try again.",
      });
      setCode([]);
    },
  });
  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const onNumberPress = (number: number) => {
    // Prevent input while verifying
    if (
      code.length < CODE_FIELDS &&
      !isVerifying &&
      !verifyPinMutation.isPending
    ) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode((prev) => [...prev, number]);
    }
  };
  const onBackSpacePress = () => {
    // Prevent backspace while verifying
    if (code.length > 0 && !isVerifying && !verifyPinMutation.isPending) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode(code.slice(0, -1));
    }
  };
  const onBiometricPress = async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    if (success) {
      // Clear the background flag when biometric is verified
      await AsyncStorage.setItem("userInactivity:wasInBackground", "false");
      router.replace("/(app)/(home)");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  console.log("code", code);

  useEffect(() => {
    const handleBiometric = async () => {
      const { success } = await LocalAuthentication.authenticateAsync();
      if (success) {
        // Clear the background flag when biometric is verified
        await AsyncStorage.setItem("userInactivity:wasInBackground", "false");
        router.replace("/(app)/(home)");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };
    handleBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // Only verify if we have 4 digits, not already verifying, and mutation is not pending
    if (
      code.length === CODE_FIELDS &&
      !isVerifying &&
      !verifyPinMutation.isPending
    ) {
      const pin = code.join("");
      setIsVerifying(true);
      verifyPinMutation.mutate({ pin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code.length]); // Only depend on code.length, not the entire code array or mutation

  return (
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
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your PIN to continue</Text>
        </View>

        <Animated.View style={[styles.codeView, style]}>
          {codeLength.map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeEmpty,
                {
                  backgroundColor:
                    index < code.length ? COLORS.primary_400 : "transparent",
                  borderColor:
                    index < code.length
                      ? COLORS.primary_400
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
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {[base, base + 1, base + 2].map((number) => (
                  <TouchableOpacity
                    key={number}
                    style={[styles.keypadBtn, styles.numberBtn]}
                    onPress={() => onNumberPress(number)}
                  >
                    <Text style={styles.number}>{number}</Text>
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
              <Text style={styles.number}>0</Text>
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
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: COLORS.primary_400,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appIcon: {
    width: 60,
    height: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textColor,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "400",
  },
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
  codeEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  numbersView: {
    marginHorizontal: 40,
    gap: 24,
    marginTop: 20,
  },
  number: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.textColor,
  },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biometricBtn: {
    backgroundColor: COLORS.primary_100,
    borderWidth: 1,
    borderColor: COLORS.primary_200,
  },
  backspaceBtn: {
    backgroundColor: "transparent",
  },
  disabledKeypad: {
    opacity: 0.4,
  },
});
export default LockScreen;
