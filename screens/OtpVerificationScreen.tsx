import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

const CODE_LENGTH = 6;

const OtpVerificationScreen = () => {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const digits = useMemo(() => code.split(""), [code]);

  const handleChangeText = (text: string) => {
    const sanitized = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(sanitized);
  };

  const getLineColor = (index: number) => {
    const hasValue = index < digits.length;
    const isCellFocused =
      isFocused &&
      ((digits.length === CODE_LENGTH && index === CODE_LENGTH - 1) ||
        index === digits.length);

    if (isCellFocused) {
      return COLORS.primary_400;
    }
    if (hasValue) {
      return COLORS.textColor;
    }
    return "#D9D9D9";
  };

  const handleCellPress = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (code.length !== CODE_LENGTH) return;

    router.push("/(auth)/reset-password");
  };

  return (
    <ScrollView
      className="flex-1 bg-light px-6"
      bounces={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 48,
      }}
    >
      <View className="mb-12 flex-row justify-between">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={20} color="#2A3A50" />
        </Pressable>
        <View className="h-10 w-10" />
      </View>

      <View className="items-center">
        <Text family="nunito" weight="bold" className="text-center text-3xl">
          Enter your OTP code
        </Text>
        <Text className="mt-3 w-[90%] text-center text-sm text-tertiary opacity-70">
          We just sent a message, please open it and enter OTP code in that
          message below to Identify your account
        </Text>
      </View>

      <View className="mt-12 items-center">
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={CODE_LENGTH}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
          caretHidden
          contextMenuHidden
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            width: 0,
          }}
        />
        <View className="flex-row justify-center gap-3 ">
          {Array.from({ length: CODE_LENGTH }).map((_, index) => {
            const digit = digits[index] ?? "";
            const lineColor = getLineColor(index);
            return (
              <Pressable
                key={index}
                onPress={handleCellPress}
                className="items-center"
                hitSlop={6}
              >
                <View className="h-12 w-10 items-center justify-end">
                  <Text
                    className={cn(
                      "text-xl text-tertiary",
                      !digit && "text-tertiary/40",
                    )}
                  >
                    {digit}
                  </Text>
                  <View
                    style={{
                      height: 2,
                      width: "100%",
                      backgroundColor: lineColor,
                      borderRadius: 999,
                    }}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-12">
        <Button
          title="Submit OTP"
          disabled={code.length !== CODE_LENGTH}
          onPress={handleSubmit}
          className="mt-2"
        />

        <Pressable
          className="mt-5 items-center"
          onPress={() => router.replace("/(auth)/forgot-password")}
        >
          <Text className="text-sm text-tertiary opacity-80">
            Change my email address
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default OtpVerificationScreen;
