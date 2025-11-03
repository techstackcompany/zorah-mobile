import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

const isStrongPassword = (value: string) => {
  if (value.length < 8) return false;

  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);

  return hasLetter && hasNumber;
};

const ResetPasswordScreen = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword &&
      isStrongPassword(password)
    );
  }, [password, confirmPassword]);

  const showStrength = isStrongPassword(password);

  const handleSubmit = () => {
    if (!canSubmit) return;

    router.replace("/signIn");
  };

  const inputContainer = (focused: boolean) =>
    cn(
      "rounded-2xl border bg-white px-4 py-3",
      focused ? "border-primary_400" : "border-gray-200",
    );

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
          Gotcha!
        </Text>
        <Text className="mt-3 text-center text-sm text-tertiary opacity-70">
          Let&apos;s create a new password for your account
        </Text>
      </View>

      <View className="mt-12">
        <Text className="mb-2 text-sm text-tertiary">New Password</Text>
        <View className={inputContainer(passwordFocused)}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            className="font-poppins text-base text-tertiary"
            placeholder="Enter here"
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            autoCapitalize="none"
          />
        </View>
        {showStrength ? (
          <View className="mt-3 flex-row items-center">
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: COLORS.secondary_500,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={16} color="#ffffff" />
            </View>
            <Text className="ml-3 text-sm text-secondary_500">
              Strong password
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-8">
        <Text className="mb-2 text-sm text-tertiary">
          Confirm your new Password
        </Text>
        <View className={inputContainer(confirmFocused)}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="font-poppins text-base text-tertiary"
            placeholder="Enter here"
            secureTextEntry
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View className="mt-12">
        <Button
          title="Submit New Password"
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
      </View>
    </ScrollView>
  );
};

export default ResetPasswordScreen;
