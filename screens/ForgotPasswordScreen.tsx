import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const ForgotPasswordScreen = () => {
  const [phone, setPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validate = () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!/^[\d\s+()-]{6,20}$/.test(phone.trim())) {
      setError("Enter a valid phone number");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    console.log("Forgot password phone:", phone);
    // TODO: Hook into OTP flow once available.
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

      <View className="mb-10">
        <Text family="nunito" weight="bold" className="mb-3 text-center text-3xl">
          Forgotten Password
        </Text>
        <Text className="text-center text-sm text-tertiary opacity-70">
          Please enter your phone number below that we will have you to recover
          your account
        </Text>
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm text-tertiary">Phone Number</Text>
        <View
          className={cn(
            "flex-row items-center rounded-2xl border bg-white px-4 py-3",
            isFocused ? "border-primary_400" : "border-gray-200",
            error && "border-red-500",
          )}
        >
          <View className="mr-3 flex-row overflow-hidden rounded-md">
            <View className="h-6 w-[10px] bg-[#008751]" />
            <View className="h-6 w-[10px] bg-white" />
            <View className="h-6 w-[10px] bg-[#008751]" />
          </View>
          <TextInput
            className="flex-1 font-poppins text-base text-tertiary"
            value={phone}
            onChangeText={setPhone}
            placeholder="000 000 000"
            keyboardType="phone-pad"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
        {error ? (
          <Text className="mt-2 text-sm text-red-500">{error}</Text>
        ) : null}
      </View>

      <Button title="Next" onPress={handleSubmit} className="mt-2 w-full" />

      <View className="mt-8 flex-row justify-center">
        <Text className="text-sm text-tertiary opacity-60">Continue by </Text>
        <Link asChild href="/signIn">
          <Pressable>
            <Text weight="semibold" className="text-sm text-primary_400">
              Signing In
            </Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
