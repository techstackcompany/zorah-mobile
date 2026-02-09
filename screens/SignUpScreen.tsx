// import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useSession } from "@/contexts/auth-context/useSession";
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/api/client";
import { useRegisterUserMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";

import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SignUpScreen = () => {
  return <OriginalSignUpScreen />;
};

export default SignUpScreen;

const OriginalSignUpScreen = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { setUserData, signIn, setHasCompletedSetup, setSetupStep } =
    useSession();
  const registerMutation = useRegisterUserMutation();
  const isSubmitting = registerMutation.isPending;

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Please enter your name";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!/^\d{10,15}$/.test(form.phone))
      newErrors.phone = "Please enter phone number";
    if (!form.password.trim()) newErrors.password = "Please enter password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.email, form.name, form.password, form.phone]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      setApiErrorMessage(null);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      const response = await registerMutation.mutateAsync(payload);

      setUserData({
        ...response,
        phone: form.phone.trim(),
      });
      setHasCompletedSetup(false);
      setSetupStep(1);
      await signIn(response.token);
      Toast.show({
        type: "success",
        text1: "Account created",
        text2: response?.name
          ? `Welcome, ${response.name}!`
          : "Welcome to Zorah!",
      });

      router.replace("/(auth)/setup/kyc-details");
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
        "We could not create your account.";
      setApiErrorMessage(message);
      Toast.show({
        type: "error",
        text1: "Sign up failed",
        text2: message,
      });
    }
  }, [
    validate,
    form.name,
    form.email,
    form.password,
    form.phone,
    registerMutation,
    setUserData,
    setHasCompletedSetup,
    setSetupStep,
    signIn,
    router,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -60}
    >
      <ScrollView
        className="flex-1 px-6 bg-white"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 48,
          flexGrow: 1,
        }}
      >
        <View className="flex-1 justify-center">
          <Text
            family="nunito"
            weight="bold"
            className="mb-8 text-center text-3xl"
          >
            Create Your Account
          </Text>

          <View className="mb-4">
            <Text className="mb-2 text-sm text-tertiary">Name</Text>
            <TextInput
              value={form.name}
              onChangeText={(t) => {
                setApiErrorMessage(null);
                setForm({ ...form, name: t });
              }}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              placeholder="Enter your full name"
              className={cn(
                "rounded-xl border border-gray-200 bg-white px-4 py-3 font-poppins text-base",
                focused === "name" && "focus",
                errors.name ? "border-red-500" : "focus:border-primary_400",
              )}
            />
            {errors.name && (
              <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm text-tertiary">Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(t) => {
                setApiErrorMessage(null);
                setForm({ ...form, email: t });
              }}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className={cn(
                "rounded-xl border border-gray-200 bg-white px-4 py-3 font-poppins text-base",
                focused === "email" && "focus",
                errors.email ? "border-red-500" : "focus:border-primary_400",
              )}
            />
            {errors.email && (
              <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm text-tertiary">Password</Text>
            <View
              className={cn(
                "flex-row items-center rounded-xl border bg-white px-4",
                focused === "password" && "border-blue-500",
                errors.password
                  ? "border-red-500"
                  : "border-gray-300 focus:border-blue-500",
              )}
            >
              <TextInput
                value={form.password}
                onChangeText={(t) => {
                  setApiErrorMessage(null);
                  setForm({ ...form, password: t });
                }}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Create a Password"
                secureTextEntry={!showPassword}
                className="flex-1 py-3 font-poppins text-base "
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.password}
              </Text>
            )}
          </View>

          <Pressable
            onPress={() => {
              setApiErrorMessage(null);
              setAgree(!agree);
            }}
            className="mb-6 flex-row items-center"
          >
            <View
              className={cn(
                "mr-3 h-6 w-6 items-center justify-center rounded-md border",
                agree ? "" : "border-textColor",
              )}
            >
              {agree && (
                <Ionicons name="checkmark" size={14} color={COLORS.textColor} />
              )}
            </View>
            <Text className="text-sm">I Agree to </Text>
            <Link asChild href={"/"}>
              <Pressable>
                <Text
                  weight="semibold"
                  className="text-sm text-primary_400 active:underline"
                >
                  Service Policy, Terms and Condition
                </Text>
              </Pressable>
            </Link>
          </Pressable>

          {apiErrorMessage ? (
            <Text className="mb-3 text-center text-sm text-red-500">
              {apiErrorMessage}
            </Text>
          ) : null}
          <Pressable
            disabled={!agree || isSubmitting}
            onPress={handleSubmit}
            className={cn(
              "mb-6 items-center justify-center rounded-xl py-4",
              agree ? "bg-primary_400" : "bg-primary_400/30",
              isSubmitting && "opacity-80",
            )}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Create Account
              </Text>
            )}
          </Pressable>

          <Link asChild href={"/signIn"}>
            <Pressable className="flex-row items-center justify-center gap-2">
              <Text className="text-tertiary">Existing User?</Text>
              <Text weight="medium" className="text-primary_400">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
