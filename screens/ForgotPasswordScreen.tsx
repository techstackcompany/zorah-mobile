import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { useRequestPasswordResetMutation } from "@/src/api/hooks";
import { ApiError } from "@/src/api/client";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const requestResetMutation = useRequestPasswordResetMutation();

  const isSubmitting = requestResetMutation.isPending;

  const validate = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setError("Enter a valid email address");
      return false;
    }

    setError(null);
    return true;
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const trimmed = email.trim().toLowerCase();
    try {
      await requestResetMutation.mutateAsync({
        email: trimmed,
      });
      Toast.show({
        type: "success",
        text1: "Check your inbox",
        text2: "We sent you a verification code.",
      });
      router.push({
        pathname: "/(auth)/forgot-password-otp",
        params: { email: trimmed },
      });
    } catch (error) {
      const apiError = error as ApiError;
      const serverMessage =
        typeof apiError?.data === "object" &&
        apiError.data !== null &&
        "message" in apiError.data &&
        typeof (apiError.data as { message?: string }).message === "string"
          ? (apiError.data as { message?: string }).message
          : undefined;
      const message =
        serverMessage ??
        apiError?.message ??
        "We could not send the reset code. Please try again.";
      setError(message);
      Toast.show({
        type: "error",
        text1: "Request failed",
        text2: message,
      });
    }
  }, [email, requestResetMutation, router, validate]);

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

      <View className="mb-10">
        <Text family="nunito" weight="bold" className="mb-3 text-center text-3xl">
          Forgotten Password
        </Text>
        <Text className="text-center text-sm text-tertiary opacity-70">
          Please enter the email associated with your account so we can help you
          recover it.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm text-tertiary">Email</Text>
        <View
          className={cn(
            "flex-row items-center rounded-2xl border bg-white px-4 py-3",
            isFocused ? "border-primary_400" : "border-gray-200",
            error && "border-red-500",
          )}
        >
          <TextInput
            className=" font-poppins text-base text-tertiary"
            value={email}
            onChangeText={(value) => {
              setError(null);
              setEmail(value);
            }}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
        {error ? (
          <Text className="mt-2 text-sm text-red-500">{error}</Text>
        ) : null}
      </View>

      <Button
        title="Next"
        onPress={handleSubmit}
        loading={isSubmitting}
        className="mt-2 w-full"
      />

      <View className="mt-8 flex-row justify-center">
        <Text weight="bold" className=" text-tertiary opacity-60">Continue by </Text>
        <Link asChild href="/signIn">
          <Pressable>
            <Text weight="bold" className=" text-primary_400">
              Signing In
            </Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
