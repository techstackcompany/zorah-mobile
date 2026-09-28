import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { PIN_LENGTH } from "@/constants/auth";
import COLORS from "@/constants/colors";
import { useAppLock } from "@/contexts/app-lock/useAppLock";
import { useSession } from "@/contexts/auth-context/useSession";
import { useBiometricSupport } from "@/hooks/useBiometricSupport";
import { setRefreshToken } from "@/lib/persistedStorageConfig";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/src/api/client";
import { useGetUserProfileQuery, useLoginUserMutation } from "@/src/api/hooks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
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

const OFFSET = 20;
const TIME = 80;

const formatCountdown = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

type LockScreenProps = {
  visible: boolean;
};

/**
 * `biometric` is the default surface on capable devices — Face ID / fingerprint
 * is the primary unlock. `pin` is the fallback, reached by dismissing the
 * biometric prompt or tapping "Use PIN instead". `reset` is the password
 * re-auth used to set a new PIN.
 */
type LockMode = "biometric" | "pin" | "reset";

const LockScreen = ({ visible }: LockScreenProps) => {
  const {
    verifyPin,
    authenticateWithBiometric,
    forgotPin,
    beginPinReset,
    isBiometricAvailable,
  } = useAppLock();
  const { signIn } = useSession();
  const { data: profile } = useGetUserProfileQuery();
  const loginMutation = useLoginUserMutation();
  const { supportsFaceId } = useBiometricSupport();

  const biometricLabel = supportsFaceId ? "Face ID" : "Fingerprint";

  const [mode, setMode] = useState<LockMode>("pin");
  const [password, setPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const offset = useSharedValue(0);
  const opacity = useSharedValue(0);

  const cooldownMs = lockedUntil ? Math.max(0, lockedUntil - now) : 0;
  const isCoolingDown = cooldownMs > 0;

  // Only tick while a cooldown is actually counting down.
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  useEffect(() => {
    if (lockedUntil && Date.now() >= lockedUntil) {
      setLockedUntil(null);
      setError(null);
    }
  }, [now, lockedUntil]);
  
  

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, opacity]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [visible]);

  
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      hasPromptedRef.current = false;
      return;
    }
    if (!isBiometricAvailable || hasPromptedRef.current) return;
    hasPromptedRef.current = true;
    const timer = setTimeout(() => {
      void authenticateWithBiometric();
    }, 400);
    return () => clearTimeout(timer);
  }, [visible, isBiometricAvailable, authenticateWithBiometric]);

  useEffect(() => {
    if (visible) {
      setPin("");
      // Biometric-capable devices start on the biometric prompt; the PIN pad
      // is the fallback, reached by dismissing it or tapping "Use PIN".
      setMode(isBiometricAvailable ? "biometric" : "pin");
      setPassword("");
      setResetError(null);
      setError(null);
    }
  }, [visible, isBiometricAvailable]);

  /**
   * "Forgot PIN" used to sign the user out. That is now a dead end: the server
   * keeps the PIN (`isPinSet`), so signing back in just locks them out again
   * with the PIN they had forgotten. Prove ownership with the account password
   * instead, then send them to set a new one.
   */
  const handleResetWithPassword = async () => {
    const email = profile?.email?.trim().toLowerCase();
    if (!email) {
      setResetError("Could not read your account. Sign out and back in.");
      return;
    }
    if (!password.trim()) {
      setResetError("Enter your password");
      return;
    }

    setResetError(null);
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      // Adopt the rotated tokens. If the backend invalidates the previous
      // refresh token on login, discarding these would break the session on
      // the next refresh. Mirrors processSignInResponse in SignInScreen.
      if (response.refreshToken) await setRefreshToken(response.refreshToken);
      if (response.accessToken) await signIn(response.accessToken);

      // Suppress re-locking before navigating — the inactivity timer or a
      // background would otherwise strand them on the way to PIN setup.
      beginPinReset();
      setPassword("");
      router.push("/(app)/settings/pin");
    } catch (error) {
      const apiError = error as ApiError;
      setResetError(
        !apiError?.status
          ? "You need a connection to reset your PIN."
          : apiError.status === 401
            ? "That password isn't right."
            : apiError.message || "Could not verify your password.",
      );
    }
  };

  const shake = () => {
    offset.value = withSequence(
      withTiming(-OFFSET, { duration: TIME / 2 }),
      withRepeat(withTiming(OFFSET, { duration: TIME / 2 }), 4, true),
      withTiming(0, { duration: TIME / 2 }),
    );
  };

  const handleNumberPress = async (number: number) => {
    if (isVerifying || isCoolingDown || pin.length >= PIN_LENGTH) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + number.toString();
    setPin(newPin);
    setError(null);

    if (newPin.length !== PIN_LENGTH) return;

    setIsVerifying(true);
    const result = await verifyPin(newPin);
    setIsVerifying(false);

    if (result.ok) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake();
    setPin("");

    switch (result.reason) {
      case "locked_out":
        setLockedUntil(Date.now() + result.retryInMs);
        setNow(Date.now());
        break;
      case "needs_connection":
        // First unlock on this device — there is nothing cached to check
        // against, so the server has to confirm it.
        setError("Connect to the internet to unlock on this device.");
        break;
      case "invalid":
        setError(
          result.attemptsRemaining === 1
            ? "Incorrect PIN. 1 attempt left."
            : `Incorrect PIN. ${result.attemptsRemaining} attempts left.`,
        );
        break;
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

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.overlay, fadeStyle]}
      pointerEvents={visible ? "auto" : "none"}
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
              {mode === "reset"
                ? "Enter your account password to set a new PIN"
                : mode === "biometric"
                  ? `Unlock with ${biometricLabel} to continue`
                  : "Enter your PIN to continue"}
            </Text>
          </View>

          {mode === "biometric" ? (
            <View style={styles.biometricPanel}>
              <Pressable
                onPress={() => void authenticateWithBiometric()}
                accessibilityRole="button"
                accessibilityLabel={`Unlock with ${biometricLabel}`}
                style={styles.biometricButton}
              >
                <Ionicons
                  name={supportsFaceId ? "scan-outline" : "finger-print"}
                  size={44}
                  color={COLORS.primary_400}
                />
              </Pressable>

              <Text className="mt-5 text-center text-[14px] text-[#6B7280]">
                Tap to try {biometricLabel} again
              </Text>

              {/* PIN is the fallback, not the default. */}
              <TouchableOpacity
                style={styles.forgotPin}
                onPress={() => setMode("pin")}
                accessibilityRole="button"
              >
                <Text
                  weight="semibold"
                  className="text-center text-[14px] text-primary_400"
                >
                  Use PIN instead
                </Text>
              </TouchableOpacity>
            </View>
          ) : mode === "reset" ? (
            <View style={styles.resetPanel}>
              <View
                className={cn(
                  "rounded-2xl border bg-white px-4",
                  resetError ? "border-error" : "border-gray-200",
                )}
              >
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setResetError(null);
                  }}
                  placeholder="Your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  autoFocus
                  onSubmitEditing={handleResetWithPassword}
                  returnKeyType="go"
                  className="py-4 font-poppins text-base text-textColor"
                />
              </View>

              <View style={styles.statusMessage}>
                {resetError ? (
                  <Text
                    weight="medium"
                    className="text-center text-[14px] text-error"
                  >
                    {resetError}
                  </Text>
                ) : null}
              </View>

              <Button
                title="Continue"
                onPress={handleResetWithPassword}
                loading={loginMutation.isPending}
                className="w-full"
              />

              <TouchableOpacity
                style={styles.forgotPin}
                onPress={() => {
                  setMode("pin");
                  setPassword("");
                  setResetError(null);
                }}
              >
                <Text
                  weight="regular"
                  className="text-center text-[14px] text-[#6B7280]"
                >
                  Back to PIN
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                          : "#CBD5E1",
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

          <View style={styles.statusMessage}>
            {isCoolingDown ? (
              <Text
                weight="medium"
                className="text-center text-[14px] text-error"
              >
                Too many attempts. Try again in {formatCountdown(cooldownMs)}.
              </Text>
            ) : error ? (
              <Text
                weight="medium"
                className="text-center text-[14px] text-error"
              >
                {error}
              </Text>
            ) : null}
          </View>

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
                      disabled={isVerifying || isCoolingDown || pin.length >= PIN_LENGTH}
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
                    disabled={isVerifying || isCoolingDown}
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
                disabled={isVerifying || isCoolingDown || pin.length >= PIN_LENGTH}
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
                    disabled={isVerifying || isCoolingDown}
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
          {/* Route back to the primary method when it is available. */}
          {isBiometricAvailable ? (
            <TouchableOpacity
              style={styles.forgotPin}
              onPress={() => {
                setMode("biometric");
                setPin("");
                setError(null);
                void authenticateWithBiometric();
              }}
              accessibilityRole="button"
            >
              <Text
                weight="semibold"
                className="text-center text-[14px] text-primary_400"
              >
                Use {biometricLabel} instead
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.forgotPinTight}
            onPress={() => setMode("reset")}
          >
            <Text
              weight="regular"
              className="text-center text-[14px] text-[#6B7280]"
            >
              Forgot PIN?{" "}
              <Text weight="semibold" className="text-[14px] text-primary_400">
                Reset it
              </Text>
            </Text>
          </TouchableOpacity>
            </>
          )}

          {/* Last resort when the account password is forgotten too. */}
          <TouchableOpacity style={styles.signOut} onPress={forgotPin}>
            <Text
              weight="regular"
              className="text-center text-[13px] text-[#9CA3AF]"
            >
              Sign out
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F4F6FB",
    zIndex: 999,
  },
  safeArea: { flex: 1 },
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
  // Fixed height so the keypad does not shift when a message appears.
  statusMessage: {
    minHeight: 20,
    justifyContent: "center",
    paddingHorizontal: 32,
    marginBottom: 4,
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
  },
  backspaceBtn: {
    backgroundColor: "transparent",
  },
  forgotPin: {
    marginTop: 28,
    alignItems: "center",
    paddingVertical: 8,
  },
  // Sits directly under another link, so it needs less space above.
  forgotPinTight: {
    marginTop: 4,
    alignItems: "center",
    paddingVertical: 8,
  },
  resetPanel: {
    marginTop: 32,
    paddingHorizontal: 32,
  },
  biometricPanel: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  biometricButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: COLORS.primary_200,
  },
  signOut: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
});

export default LockScreen;
