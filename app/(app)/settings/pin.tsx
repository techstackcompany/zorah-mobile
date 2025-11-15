import COLORS from "@/constants/colors";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import {
  useSetUserPinMutation,
  useToggleBiometricsMutation,
} from "@/src/api/hooks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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

const PinSetupScreen = () => {
  const router = useRouter();
  const { updateSetting } = useAppSettings();
  const [step, setStep] = useState<PinSetupStep>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const inputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);
  const offset = useSharedValue(0);
  const pinLength = useMemo(() => {
    return pin.length || confirmPin.length;
  }, [pin, confirmPin]);

  const toggleBiometricsMutation = useToggleBiometricsMutation({
    onSuccess: () => {
      // Update local settings after API call succeeds
      updateSetting("enableBiometrics", true);
      console.log("success");
      Toast.show({
        type: "success",
        text1: "PIN Set Successfully",
        text2: "Your PIN has been set up and biometrics enabled.",
      });

      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/(app)/(home)");
      }
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to Enable Biometrics",
        text2: error.message || "Please try again.",
      });
    },
  });

  const setPinMutation = useSetUserPinMutation({
    onSuccess: () => {
      // After PIN is set successfully, enable biometrics via API
      console.log("mutate calls");
      toggleBiometricsMutation.mutate({ enabled: true });
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
    const sanitized = text.replace(/\D/g, "").slice(0, PIN_LENGTH);
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
        // PINs match, submit to API
        console.log("mutate calls", { pin });

        setPinMutation.mutate({ pin });
      }
    }
  }, [confirmPin]);

  const currentPin = step === "create" ? pin : confirmPin;
  const currentInputRef = step === "create" ? inputRef : confirmInputRef;
  const pinDigits = currentPin.split("");
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
            {step === "create" ? "Create PIN" : "Confirm PIN"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "create"
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
                        index < pinDigits.length
                          ? COLORS.primary_400
                          : "transparent",
                      borderColor:
                        index < pinDigits.length
                          ? COLORS.primary_400
                          : COLORS.primary_200,
                      borderWidth: index < pinDigits.length ? 0 : 2,
                      opacity: isLoading ? 0 : 1,
                    },
                  ]}
                />
              ))}
            {isLoading && (
              <View style={styles.verifyingOverlay}>
                <ActivityIndicator size="small" color={COLORS.primary_400} />
              </View>
            )}
          </Animated.View>

          <TextInput
            ref={currentInputRef}
            value={currentPin}
            onChangeText={handleChangeText}
            keyboardType="number-pad"
            maxLength={PIN_LENGTH}
            style={styles.hiddenInput}
            autoFocus
          />

          <View style={styles.numbersView}>
            {[0, 1, 2].map((rowIndex) => {
              const base = rowIndex * 3 + 1;
              return (
                <View key={rowIndex} style={styles.keypadRow}>
                  {[base, base + 1, base + 2].map((number) => (
                    <TouchableOpacity
                      key={number}
                      style={[styles.keypadBtn, styles.numberBtn]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleChangeText(currentPin + number.toString());
                      }}
                    >
                      <Text style={styles.number}>{number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
            <View style={styles.keypadRow}>
              <View style={styles.keypadBtn} />
              <TouchableOpacity
                style={[styles.keypadBtn, styles.numberBtn]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleChangeText(currentPin + "0");
                }}
              >
                <Text style={styles.number}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.keypadBtn,
                  {
                    opacity: pinLength === 0 ? 0.2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleChangeText(currentPin.slice(0, -1));
                }}
                disabled={pinLength === 0}
              >
                <MaterialCommunityIcons
                  name="backspace"
                  size={22}
                  color={COLORS.textColor}
                />
              </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  appIcon: {
    width: 50,
    height: 50,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textColor,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 40,
  },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 40,
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
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  },
  numbersView: {
    marginTop: 40,
    gap: 24,
    width: "100%",
    maxWidth: 300,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  number: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.textColor,
  },
});

export default PinSetupScreen;
