import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useAppLock } from "@/contexts/app-lock/useAppLock";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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

const PIN_LENGTH = 4;
const OFFSET = 20;
const TIME = 80;

type LockScreenProps = {
  visible: boolean;
};

const LockScreen = ({ visible }: LockScreenProps) => {
  const {
    verifyPin,
    authenticateWithBiometric,
    forgotPin,
    isBiometricAvailable,
  } = useAppLock();
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const offset = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = visible ? withTiming(1, { duration: 180 }) : 0;
  }, [visible, opacity]);

  useEffect(() => {
    if (!visible || !isBiometricAvailable) return;
    const timer = setTimeout(() => {
      authenticateWithBiometric();
    }, 400);
    return () => clearTimeout(timer);
  }, [visible, isBiometricAvailable, authenticateWithBiometric]);

  useEffect(() => {
    if (visible) setPin("");
  }, [visible]);

  const shake = () => {
    offset.value = withSequence(
      withTiming(-OFFSET, { duration: TIME / 2 }),
      withRepeat(withTiming(OFFSET, { duration: TIME / 2 }), 4, true),
      withTiming(0, { duration: TIME / 2 }),
    );
  };

  const handleNumberPress = async (number: number) => {
    if (isVerifying || pin.length >= PIN_LENGTH) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + number.toString();
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      setIsVerifying(true);
      const success = await verifyPin(newPin);
      console.log("success", success);
      setIsVerifying(false);
      if (!success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        shake();
        setPin("");
      }
    }
  };

  const handleBackspace = () => {
    if (isVerifying || pin.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin((p) => p.slice(0, -1));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.appIcon}
              contentFit="contain"
            />
            <Text
              family="degular"
              weight="bold"
              className="mt-3 text-center text-[28px] tracking-[0.5px] text-textColor"
            >
              Zorah
            </Text>
            <Text
              weight="regular"
              className="mt-1 px-10 text-center text-[15px] text-[#6B7280]"
            >
              Enter your PIN to continue
            </Text>
          </View>

          <Animated.View style={[styles.codeView, animatedStyle]}>
            {Array(PIN_LENGTH)
              .fill(null)
              .map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeEmpty,
                    {
                      backgroundColor:
                        index < pin.length
                          ? COLORS.primary_400
                          : COLORS.primary_200,
                      borderColor:
                        index < pin.length
                          ? COLORS.primary_400
                          : COLORS.primary_200,
                      borderWidth: index < pin.length ? 0 : 2,
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
                <View key={rowIndex} style={styles.row}>
                  {[base, base + 1, base + 2].map((number) => (
                    <TouchableOpacity
                      key={number}
                      style={[styles.keypadBtn, styles.numberBtn]}
                      onPress={() => handleNumberPress(number)}
                      disabled={isVerifying || pin.length >= PIN_LENGTH}
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

            <View style={[styles.row, { alignItems: "center" }]}>
              <View style={styles.keypadBtn}>
                {isBiometricAvailable && (
                  <TouchableOpacity
                    style={[styles.keypadBtn, styles.numberBtn]}
                    onPress={authenticateWithBiometric}
                    disabled={isVerifying}
                  >
                    <Ionicons
                      name="finger-print"
                      size={28}
                      color={COLORS.textColor}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.keypadBtn, styles.numberBtn]}
                onPress={() => handleNumberPress(0)}
                disabled={isVerifying || pin.length >= PIN_LENGTH}
              >
                <Text weight="semibold" className="text-[28px] text-textColor">
                  0
                </Text>
              </TouchableOpacity>

              <View style={styles.keypadBtn}>
                {pin.length > 0 && (
                  <TouchableOpacity
                    style={[styles.keypadBtn, styles.backspaceBtn]}
                    onPress={handleBackspace}
                    disabled={isVerifying}
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
          <TouchableOpacity style={styles.forgotPin} onPress={forgotPin}>
            <Text
              weight="regular"
              className="text-center text-[14px] text-[#6B7280]"
            >
              Forgot PIN?{" "}
              <Text weight="semibold" className="text-[14px] text-primary_400">
                Sign out
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  centered: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 28,
    paddingHorizontal: 20,
    position: "relative",
  },
  codeEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
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
  numbersView: {
    marginHorizontal: 40,
    gap: 24,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backspaceBtn: {
    backgroundColor: "transparent",
  },
  forgotPin: {
    marginTop: 28,
    alignItems: "center",
    paddingVertical: 8,
  },
});

export default LockScreen;
