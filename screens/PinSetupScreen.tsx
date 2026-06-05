import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useAppLock } from "@/contexts/app-lock/useAppLock";
import { savePin } from "@/lib/pinStorage";
import { useGetUserProfileQuery, useSetUserPinMutation, useToggleBiometricsMutation } from "@/src/api/hooks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
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

const PIN_LENGTH = 4;
const OFFSET = 20;
const TIME = 80;

type PinSetupStep = "create" | "confirm";

const PinSetupScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { syncLockState, needsPinSetup } = useAppLock();
  const { data: profile } = useGetUserProfileQuery();
  const { mutateAsync: toggleBiometrics } = useToggleBiometricsMutation();
  const isForced = needsPinSetup || !profile?.biometricEnabled;
  const [step, setStep] = useState<PinSetupStep>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    if (!isForced) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [isForced]);
  const offset = useSharedValue(0);

  const setPinMutation = useSetUserPinMutation({
    onSuccess: async (_, variables) => {
      await savePin(variables.pin);

      if (!profile?.biometricEnabled) {
        await toggleBiometrics({ enabled: true });
      }

      await syncLockState();

      Toast.show({
        type: "success",
        text1: !profile?.biometricEnabled ? "PIN Set Up Successfully" : "PIN Updated Successfully",
        text2: !profile?.biometricEnabled
          ? "Your account is now secured with a PIN."
          : "Your PIN has been successfully updated.",
      });

      await queryClient.refetchQueries({ queryKey: ["auth", "profile"] });

      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/(app)/(home)");
      }
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to Update PIN",
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

  const currentPin = step === "create" ? pin : confirmPin;
  const isLoading = setPinMutation.isPending;

  const onNumberPress = (number: number) => {
    if (currentPin.length < PIN_LENGTH && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newPin = currentPin + number.toString();

      if (step === "create") {
        setPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          setTimeout(() => setStep("confirm"), 200);
        }
      } else {
        setConfirmPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          if (pin !== newPin) {
            setTimeout(() => {
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
            }, 200);
          } else {
            setPinMutation.mutate({ pin });
          }
        }
      }
    }
  };

  const onBackSpacePress = () => {
    if (currentPin.length > 0 && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (step === "create") {
        setPin(pin.slice(0, -1));
      } else {
        setConfirmPin(confirmPin.slice(0, -1));
      }
    }
  };

  return (
    <LinearGradient colors={["#F6FAFF", "#FFFFFF"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {!isForced && (
          <View style={styles.backButtonContainer}>
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
          </View>
        )}

        <View style={styles.header}>
          <Text
            family="degular"
            weight="bold"
            className="mb-2 text-center text-[28px] tracking-[0.5px] text-textColor"
          >
            {step === "create"
              ? isForced
                ? "Set Up PIN"
                : "Update PIN"
              : "Confirm PIN"}
          </Text>
          <Text
            weight="regular"
            className="px-10 text-center text-[15px] text-[#6B7280]"
          >
            {step === "create"
              ? isForced
                ? "Create a 4-digit PIN to secure your account"
                : "Enter your new 4-digit PIN"
              : "Re-enter your PIN to confirm"}
          </Text>
        </View>

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
                    disabled={isLoading || currentPin.length >= PIN_LENGTH}
                  >
                    <Text
                      weight="semibold"
                      className="text-[28px] text-textColor"
                    >
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
            <View style={styles.keypadBtn} />
            <TouchableOpacity
              onPress={() => onNumberPress(0)}
              style={[styles.keypadBtn, styles.numberBtn]}
              disabled={isLoading || currentPin.length >= PIN_LENGTH}
            >
              <Text weight="semibold" className="text-[28px] text-textColor">
                0
              </Text>
            </TouchableOpacity>
            <View style={styles.keypadBtn}>
              {currentPin.length > 0 && (
                <TouchableOpacity
                  style={[styles.keypadBtn, styles.backspaceBtn]}
                  onPress={onBackSpacePress}
                  disabled={isLoading}
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
  backButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
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
  header: {
    alignItems: "center",
    marginTop: 20,
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
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 20,
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
});

export default PinSetupScreen;
