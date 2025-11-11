import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { setStorageItemAsync } from "@/contexts/auth-context/useStorageState";
import { useAppSettings } from "@/contexts/settings-context/useAppSettings";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

const PIN_LENGTH = 6;

type PinSetupStep = "create" | "confirm";

export default function PinSetupScreen() {
  const router = useRouter();
  const { updateSetting } = useAppSettings();
  const [step, setStep] = useState<PinSetupStep>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  const pinDigits = useMemo(() => pin.split(""), [pin]);
  const confirmPinDigits = useMemo(() => confirmPin.split(""), [confirmPin]);

  const currentDigits = step === "create" ? pinDigits : confirmPinDigits;
  const currentInputRef = step === "create" ? inputRef : confirmInputRef;

  const getLineColor = (index: number) => {
    const hasValue = index < currentDigits.length;
    const isCellFocused =
      isFocused &&
      ((currentDigits.length === PIN_LENGTH && index === PIN_LENGTH - 1) ||
        index === currentDigits.length);

    if (isCellFocused) {
      return COLORS.primary_400;
    }
    if (hasValue) {
      return COLORS.textColor;
    }
    return "#D9D9D9";
  };

  const handleChangeText = (text: string) => {
    const sanitized = text.replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (step === "create") {
      setPin(sanitized);
    } else {
      setConfirmPin(sanitized);
    }
  };

  const handleCellPress = () => {
    currentInputRef.current?.focus();
  };

  // Focus the appropriate input when step changes
  useEffect(() => {
    if (step === "create") {
      inputRef.current?.focus();
    } else {
      confirmInputRef.current?.focus();
    }
  }, [step]);

  const handleNext = () => {
    if (pin.length !== PIN_LENGTH) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (confirmPin.length !== PIN_LENGTH) return;

    if (pin !== confirmPin) {
      Toast.show({
        type: "error",
        text1: "PIN Mismatch",
        text2: "The PINs you entered do not match. Please try again.",
      });
      setConfirmPin("");
      return;
    }

    try {
      await setStorageItemAsync("userPin", pin);
      updateSetting("enableBiometrics", true);

      Toast.show({
        type: "success",
        text1: "PIN Set Successfully",
        text2: "Your PIN has been set and biometric login is now enabled.",
      });

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save PIN. Please try again.",
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: step === "create" ? "Create PIN" : "Confirm PIN",
          headerTitleStyle: { fontFamily: "NunitoSemibold", fontSize: 18 },
        }}
      />
      <MainContainer edges={["top", "left", "right"]} className="bg-lightMuted">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary_100">
              <Ionicons
                name="lock-closed-outline"
                size={40}
                color={COLORS.primary_400}
              />
            </View>
            <Text
              weight="semibold"
              className="text-center text-xl text-textColor"
            >
              {step === "create" ? "Create Your PIN" : "Confirm Your PIN"}
            </Text>
            <Text className="mt-3 text-center text-sm text-textColor/70">
              {step === "create"
                ? "Enter a 6-digit PIN to secure your account"
                : "Re-enter your PIN to confirm"}
            </Text>
          </View>

          <View className="mt-12 items-center">
            {step === "create" ? (
              <TextInput
                ref={inputRef}
                value={pin}
                onChangeText={handleChangeText}
                keyboardType="number-pad"
                maxLength={PIN_LENGTH}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                caretHidden
                contextMenuHidden
                secureTextEntry
                style={{
                  position: "absolute",
                  opacity: 0,
                  height: 0,
                  width: 0,
                }}
              />
            ) : (
              <TextInput
                ref={confirmInputRef}
                value={confirmPin}
                onChangeText={handleChangeText}
                keyboardType="number-pad"
                maxLength={PIN_LENGTH}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                caretHidden
                contextMenuHidden
                secureTextEntry
                style={{
                  position: "absolute",
                  opacity: 0,
                  height: 0,
                  width: 0,
                }}
              />
            )}
            <View className="flex-row justify-center gap-3">
              {Array.from({ length: PIN_LENGTH }).map((_, index) => {
                const digit = currentDigits[index] ?? "";
                const lineColor = getLineColor(index);
                return (
                  <Pressable
                    key={index}
                    onPress={handleCellPress}
                    className="items-center"
                    hitSlop={6}
                  >
                    <View className="h-14 w-12 items-center justify-center">
                      {digit ? (
                        <View
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: COLORS.textColor }}
                        />
                      ) : (
                        <View
                          style={{
                            height: 2,
                            width: "100%",
                            backgroundColor: lineColor,
                            borderRadius: 999,
                          }}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-12">
            <Pressable
              onPress={step === "create" ? handleNext : handleConfirm}
              disabled={
                step === "create"
                  ? pin.length !== PIN_LENGTH
                  : confirmPin.length !== PIN_LENGTH
              }
              className={cn(
                "rounded-2xl py-4",
                step === "create"
                  ? pin.length !== PIN_LENGTH
                    ? "bg-gray-200"
                    : "bg-primary_400"
                  : confirmPin.length !== PIN_LENGTH
                    ? "bg-gray-200"
                    : "bg-primary_400",
              )}
            >
              <Text
                weight="semibold"
                className="text-center text-base text-white"
              >
                {step === "create" ? "Continue" : "Confirm & Enable"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </MainContainer>
    </>
  );
}
