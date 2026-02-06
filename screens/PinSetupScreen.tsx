import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import useSetUpStep from "@/hooks/useSetUpStep";
import {
  useSetUserPinMutation,
  useToggleBiometricsMutation,
} from "@/src/api/hooks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
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

const PIN_LENGTH = 4;
const OFFSET = 20;
const TIME = 80;

type PinSetupStep = "create" | "confirm";

type PinSetupScreenProps = {
  variant?: "settings" | "setup";
};

const PinSetupScreen = ({ variant = "settings" }: PinSetupScreenProps) => {
  const router = useRouter();
  const { updateSetting } = useAppSettings();
  const { setHasCompletedSetup, setSetupStep } = useSession();
  const [step, setStep] = useState<PinSetupStep>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);
  const offset = useSharedValue(0);
  useSetUpStep(5, variant);
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricsAvailable(hasHardware && isEnrolled);
      } catch {
        setBiometricsAvailable(false);
      }
    };
    checkBiometrics();
  }, []);

  const toggleBiometricsMutation = useToggleBiometricsMutation({
    onSuccess: () => {
      updateSetting("enableBiometrics", true);
      Toast.show({
        type: "success",
        text1: "PIN Set Successfully",
        text2: "Your PIN has been set up and biometrics enabled.",
      });

      if (variant === "setup") {
        setHasCompletedSetup(true);
        setSetupStep(null);
        router.replace("/(app)/(home)");
      } else {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push("/(app)/(home)");
        }
      }
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to Enable Biometrics",
        text2: error.message || "Please try again.",
      });
      setPin("");
      setConfirmPin("");
      setStep("create");
    },
  });

  const setPinMutation = useSetUserPinMutation({
    onSuccess: () => {
      if (biometricsAvailable) {
        toggleBiometricsMutation.mutate({ enabled: true });
      } else {
        // If biometrics not available, just complete the setup
        if (variant === "setup") {
          setHasCompletedSetup(true);
          setSetupStep(null);
          router.replace("/(app)/(home)");
        } else {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/(app)/(home)");
          }
        }
        Toast.show({
          type: "success",
          text1: "PIN Set Successfully",
          text2: "Your account is now secured with PIN.",
        });
      }
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to Set PIN",
        text2: error.message || "Please try again.",
      });
      setPin("");
      setConfirmPin("");
      setStep("create");
    },
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const handleChangeText = (text: string) => {
    const sanitized = text.replace(/\\D/g, "").slice(0, PIN_LENGTH);
    if (step === "create") {
      setPin(sanitized);
    } else {
      setConfirmPin(sanitized);
    }
  };

  useEffect(() => {
    if (step === "create") {
      inputRef.current?.focus();
    } else {
      confirmInputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH && step === "create") {
      setStep("confirm");
    }
  }, [pin, step]);

  useEffect(() => {
    if (confirmPin.length === PIN_LENGTH && step === "confirm") {
      if (pin !== confirmPin) {
        offset.value = withSequence(
          withTiming(-OFFSET, { duration: TIME / 20 }),
          withRepeat(withTiming(OFFSET, { duration: TIME / 2 }), 4, true),
          withTiming(0, { duration: TIME / 2 }),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: "error",
          text1: "PIN Mismatch",
          text2: "The PINs you entered do not match. Please try again.",
        });
        setConfirmPin("");
        setStep("create");
        setPin("");
      } else {
        setPinMutation.mutate({ pin });
      }
    }
  }, [confirmPin, offset, pin, setPinMutation, step]);

  const currentPin = step === "create" ? pin : confirmPin;
  const currentInputRef = step === "create" ? inputRef : confirmInputRef;
  const isLoading = useMemo(
    () => setPinMutation.isPending || toggleBiometricsMutation.isPending,
    [setPinMutation.isPending, toggleBiometricsMutation.isPending],
  );

  return (
    <LinearGradient colors={["#F6FAFF", "#FFFFFF"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(app)/(home)/profile");
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.tertiary} />
          </TouchableOpacity>
          <View style={[styles.iconContainer, { marginLeft: -40 }]}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.appIcon}
              contentFit="contain"
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {variant === "setup"
              ? "Secure Your Account"
              : step === "create"
                ? "Create PIN"
                : "Confirm PIN"}
          </Text>
          <Text style={styles.subtitle}>
            {variant === "setup"
              ? biometricsAvailable
                ? "Create a 4-digit PIN and enable biometric authentication to secure your account"
                : "Create a 4-digit PIN to secure your account"
              : step === "create"
                ? "Enter a 4-digit PIN to secure your account"
                : "Re-enter your PIN to confirm"}
          </Text>

          <Animated.View style={[styles.codeView, style]}>
            {Array(PIN_LENGTH)
              .fill(null)
              .map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeEmpty,
                    {
                      backgroundColor:
                        index < currentPin.length
                          ? COLORS.primary_400
                          : "transparent",
                      borderColor:
                        index < currentPin.length
                          ? COLORS.primary_400
                          : COLORS.primary_200,
                      borderWidth: index < currentPin.length ? 0 : 2,
                    },
                  ]}
                />
              ))}
          </Animated.View>

          {/* Hidden TextInput for keyboard input */}
          <TextInput
            ref={currentInputRef}
            style={styles.hiddenInput}
            value={currentPin}
            onChangeText={handleChangeText}
            keyboardType="numeric"
            maxLength={PIN_LENGTH}
            autoFocus={step === "create"}
            secureTextEntry
          />

          <View style={styles.numbersView}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <TouchableOpacity
                key={number}
                style={[styles.keypadBtn, styles.numberBtn]}
                onPress={() => {
                  const newPin = currentPin + number;
                  if (newPin.length <= PIN_LENGTH) {
                    handleChangeText(newPin);
                  }
                }}
                disabled={isLoading || currentPin.length >= PIN_LENGTH}
              >
                <Text style={styles.number}>{number}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.lastRow}>
              <View style={styles.keypadBtn} />
              <TouchableOpacity
                style={[styles.keypadBtn, styles.numberBtn]}
                onPress={() => {
                  const newPin = currentPin + "0";
                  if (newPin.length <= PIN_LENGTH) {
                    handleChangeText(newPin);
                  }
                }}
                disabled={isLoading || currentPin.length >= PIN_LENGTH}
              >
                <Text style={styles.number}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.keypadBtn, styles.backspaceBtn]}
                onPress={() => {
                  handleChangeText(currentPin.slice(0, -1));
                }}
                disabled={isLoading || currentPin.length === 0}
              >
                <MaterialCommunityIcons
                  name="backspace-outline"
                  size={24}
                  color={COLORS.textColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary_400} />
              <Text style={styles.loadingText}>
                {setPinMutation.isPending
                  ? "Setting up PIN..."
                  : "Enabling biometrics..."}
              </Text>
            </View>
          )}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  appIcon: {
    width: 50,
    height: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textColor,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textColor + "B3",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 22,
  },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
    gap: 16,
  },
  codeEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  numbersView: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: 240,
    gap: 24,
    marginTop: 20,
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
  backspaceBtn: {
    backgroundColor: "transparent",
  },
  lastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  number: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.textColor,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textColor,
    fontWeight: "500",
  },
});

export default PinSetupScreen;
