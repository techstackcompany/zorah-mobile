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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const [agree, setAgree] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { signIn, setHasCompletedSetup, setSetupStep } = useSession();
  const registerMutation = useRegisterUserMutation();
  const isSubmitting = registerMutation.isPending;

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!form.firstName.trim())
      newErrors.firstName = "Please enter your first name";
    if (!form.lastName.trim())
      newErrors.lastName = "Please enter your last name";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";
    if (!form.password.trim()) newErrors.password = "Please enter password";
    if (!form.phoneNumber.trim())
      newErrors.phoneNumber = "Please enter your phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    form.email,
    form.firstName,
    form.lastName,
    form.password,
    form.phoneNumber,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      setApiErrorMessage(null);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
      };
      const response = await registerMutation.mutateAsync(payload);

      setHasCompletedSetup(false);
      setSetupStep(1);
      await signIn(response.token);
      Toast.show({
        type: "success",
        visibilityTime: 2000,
        onHide: () => router.replace("/(auth)/setup/monthly-income"),

        text1: "Account created",
        text2: response?.name
          ? `Welcome, ${response.name}!`
          : "Welcome to Zorah!",
      });
    } catch (error) {
      console.log("error", error);
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
    form.firstName,
    form.lastName,
    form.email,
    form.password,
    form.phoneNumber,
    registerMutation,
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
        className="flex-1 bg-white px-6"
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
          <View className="mb-4 flex-row items-center justify-between gap-2">
            <View className="flex-1">
              <Text className="mb-2 text-sm text-tertiary">First Name</Text>
              <TextInput
                value={form.firstName}
                onChangeText={(t) => {
                  setApiErrorMessage(null);
                  setForm({ ...form, firstName: t });
                }}
                onFocus={() => setFocused("firstName")}
                onBlur={() => setFocused(null)}
                placeholderTextColor={COLORS.grey}
                placeholder="John"
                className={cn(
                  "rounded-xl border border-gray-200 bg-white px-4 py-3 font-poppins text-base",
                  focused === "firstName" && "focus",
                  errors.firstName
                    ? "border-red-500"
                    : "focus:border-primary_400",
                )}
              />
              {errors.firstName && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.firstName}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-sm text-tertiary">Last Name</Text>
              <TextInput
                value={form.lastName}
                placeholderTextColor={COLORS.grey}
                onChangeText={(t) => {
                  setApiErrorMessage(null);
                  setForm({ ...form, lastName: t });
                }}
                onFocus={() => setFocused("lastName")}
                onBlur={() => setFocused(null)}
                placeholder="Babatunde"
                className={cn(
                  "rounded-xl border border-gray-200 bg-white px-4 py-3 font-poppins text-base",
                  focused === "lastName" && "focus",
                  errors.lastName
                    ? "border-red-500"
                    : "focus:border-primary_400",
                )}
              />
              {errors.lastName && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.lastName}
                </Text>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm text-tertiary">Phone Number</Text>
            <TextInput
              value={form.phoneNumber}
              placeholderTextColor={COLORS.grey}
              onChangeText={(t) => {
                setApiErrorMessage(null);
                setForm({ ...form, phoneNumber: t });
              }}
              onFocus={() => setFocused("phoneNumber")}
              onBlur={() => setFocused(null)}
              placeholder="08012000000"
              keyboardType="phone-pad"
              className={cn(
                "rounded-xl border border-gray-200 bg-white px-4 py-3 font-poppins text-base",
                focused === "phoneNumber" && "focus",
                errors.phoneNumber
                  ? "border-red-500"
                  : "focus:border-primary_400",
              )}
            />
            {errors.phoneNumber && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.phoneNumber}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm text-tertiary">Email</Text>
            <TextInput
              value={form.email}
              placeholderTextColor={COLORS.grey}
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
                placeholderTextColor={COLORS.grey}
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
              "mb-6 items-center justify-center rounded-xl py-4 active:opacity-80",
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
